import { transform } from "sucrase";
import { SandboxError } from "./errors";

const MAX_SOURCE_BYTES = 64 * 1024;

export function transformWidgetSource(source: string): string {
  if (source.length > MAX_SOURCE_BYTES) {
    throw new SandboxError("compile", "Widget source is too large.");
  }

  if (/^\s*import\s/m.test(source) || /\brequire\s*\(/.test(source)) {
    throw new SandboxError(
      "compile",
      "Widgets cannot import modules or use require(). Define a top-level `function Widget(args) { … }` that returns JSX.",
    );
  }
  try {
    const { code } = transform(source, {
      transforms: ["typescript", "jsx"],
      jsxRuntime: "classic",
      jsxPragma: "React.createElement",
      jsxFragmentPragma: "React.Fragment",
      production: true,
    });
    return code;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to compile.";
    throw new SandboxError("compile", message);
  }
}
