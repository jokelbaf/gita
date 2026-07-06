import ivm from "isolated-vm";
import { renderLog } from "../logger.server";
import { SandboxError } from "./errors";
import { transformWidgetSource } from "./transform.server";

export { SandboxError } from "./errors";
export type { SandboxFailure } from "./errors";

const MEMORY_LIMIT_MB = 32;
const TIMEOUT_MS = 1_000;
const PRELUDE_TIMEOUT_MS = 200;

export interface WidgetNode {
  type: string;
  props: Record<string, unknown>;
}

// Trusted prelude, injected before any widget code. Defines the JSX factory the
// transformed source targets (React.createElement) so components resolve to plain,
// JSON-serializable `{ type, props }` trees entirely inside the isolate
const PRELUDE = `
(function () {
  var MAX_NODES = 5000;
  var count = 0;
  function normChild(c) {
    if (c === null || c === undefined || c === false || c === true) return null;
    if (typeof c === 'number') return String(c);
    if (Array.isArray(c)) return normChildren(c);
    return c;
  }
  function normChildren(children) {
    if (children === undefined || children === null) return undefined;
    if (Array.isArray(children)) {
      var out = [];
      for (var i = 0; i < children.length; i++) {
        var n = normChild(children[i]);
        if (n !== null && n !== undefined) out.push(n);
      }
      return out;
    }
    return normChild(children);
  }
  function createElement(type, config) {
    if (++count > MAX_NODES) throw new Error('Widget produced too many elements.');
    var props = {};
    if (config) {
      for (var k in config) {
        if (k === 'key' || k === 'ref') continue;
        props[k] = config[k];
      }
    }
    var extra = Array.prototype.slice.call(arguments, 2);
    var children = extra.length > 0
      ? (extra.length === 1 ? extra[0] : extra)
      : props.children;
    var normd = normChildren(children);
    if (normd !== undefined) props.children = normd; else delete props.children;
    if (typeof type === 'function') return type(props);
    if (type === React.Fragment) {
      return { type: 'div', props: { style: { display: 'flex' }, children: props.children } };
    }
    return { type: String(type), props: props };
  }
  globalThis.React = { createElement: createElement, Fragment: { __fragment: true } };
  globalThis.__serialize = function (node) {
    var json = JSON.stringify(node);
    if (json === undefined) throw new Error('Widget did not return an element.');
    if (json.length > 512 * 1024) throw new Error('Rendered element tree is too large.');
    return json;
  };
})();
`;

const HARNESS = `
;globalThis.__result = (function () {
  if (typeof Widget !== 'function') {
    throw new Error('Your widget must define a top-level function named Widget.');
  }
  return __serialize(Widget(__args));
})();
`;

function mapError(error: unknown): SandboxError {
  if (error instanceof SandboxError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (/timed out|timeout/i.test(message)) {
    return new SandboxError("timeout", "Widget took too long to render.");
  }
  if (/memory limit|out of memory|disposed/i.test(message)) {
    return new SandboxError("memory", "Widget exceeded the memory limit.");
  }
  return new SandboxError("runtime", message);
}

/**
 * Compile and execute widget source with the given args, returning the element
 * tree for Satori. Throws a typed {@link SandboxError} on any failure.
 */
export async function runWidget(
  source: string,
  args: Record<string, unknown>,
): Promise<WidgetNode> {
  const compiled = transformWidgetSource(source);
  const isolate = new ivm.Isolate({ memoryLimit: MEMORY_LIMIT_MB });
  try {
    const context = await isolate.createContext();
    const prelude = await isolate.compileScript(PRELUDE);
    await prelude.run(context, { timeout: PRELUDE_TIMEOUT_MS });

    await context.global.set(
      "__args",
      new ivm.ExternalCopy(args).copyInto({ release: true }),
    );

    const script = await isolate.compileScript(compiled + HARNESS, {
      filename: "widget.tsx",
    });
    await script.run(context, { timeout: TIMEOUT_MS });

    const result: unknown = await context.global.get("__result", {
      copy: true,
    });
    if (typeof result !== "string") {
      throw new SandboxError("output", "Widget did not produce any output.");
    }
    let node: unknown;
    try {
      node = JSON.parse(result);
    } catch {
      throw new SandboxError("output", "Widget output was not serializable.");
    }
    if (
      !node ||
      typeof node !== "object" ||
      typeof (node as WidgetNode).type !== "string"
    ) {
      throw new SandboxError(
        "output",
        "Widget must return a single root element.",
      );
    }
    return node as WidgetNode;
  } catch (error) {
    const mapped = mapError(error);
    renderLog.debug(
      { failure: mapped.failure, msg: mapped.message },
      "sandbox failure",
    );
    throw mapped;
  } finally {
    if (!isolate.isDisposed) isolate.dispose();
  }
}
