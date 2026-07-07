import type { SessionUser } from "../context";
import type { SortKey, TypeFilter } from "~/lib/widget";
import { authenticateApiKey } from "../api-keys.server";
import {
  createInstanceOp,
  createWidgetOp,
  deleteInstanceOp,
  deleteWidgetOp,
  forkWidgetOp,
  getWidgetOp,
  listInstancesOp,
  listWidgetsOp,
  setVisibilityOp,
  updateWidgetOp,
} from "./operations.server";

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = { name: "gita", version: "1.0.0" };

type JsonObject = Record<string, unknown>;

type ToolRun = (
  user: SessionUser,
  args: JsonObject,
  origin: string,
) => Promise<unknown>;

interface ToolDef {
  name: string;
  description: string;
  inputSchema: JsonObject;
  run: ToolRun;
}

const str = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;
const bool = (v: unknown): boolean => v === true;
const num = (v: unknown): number | undefined =>
  typeof v === "number" ? v : undefined;

const TYPE_FILTERS: TypeFilter[] = ["all", "GENERIC", "USER", "REPO"];
const SORTS: SortKey[] = ["popular", "trending", "newest"];

const oneOf =
  <T extends string>(allowed: readonly T[]) =>
  (v: unknown): T | undefined =>
    typeof v === "string" && (allowed as readonly string[]).includes(v)
      ? (v as T)
      : undefined;

const asTypeFilter = oneOf(TYPE_FILTERS);
const asSort = oneOf(SORTS);

const WIDGET_TYPE_SCHEMA = { enum: ["GENERIC", "USER", "REPO"] };
const VISIBILITY_SCHEMA = { enum: ["PUBLIC", "PRIVATE"] };

const ARGS_SCHEMA_SCHEMA = {
  type: "array",
  description:
    "Template arguments the widget accepts. Each item: { name, label, type: string|number|boolean|enum|color, default, required, description?, options?, min?, max?, maxLength? }.",
  items: { type: "object" },
};

const TOOLS: ToolDef[] = [
  {
    name: "whoami",
    description:
      "Return the authenticated gita account. Use this to verify the connection and API key.",
    inputSchema: { type: "object", properties: {} },
    run: async (user) => ({
      id: user.id,
      username: user.username,
      name: user.name,
    }),
  },
  {
    name: "list_widgets",
    description:
      "Browse or search the widget library. Returns public widgets plus your own private ones (pass mine=true for only yours). Supports search, type/sort filters and cursor pagination.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string" },
        type: WIDGET_TYPE_SCHEMA,
        sort: { enum: SORTS },
        forksOnly: { type: "boolean" },
        mine: { type: "boolean" },
        cursor: { type: "string" },
        limit: { type: "number" },
      },
    },
    run: (user, args, origin) =>
      listWidgetsOp(
        user,
        {
          search: str(args.search),
          type: asTypeFilter(args.type),
          sort: asSort(args.sort),
          forksOnly: bool(args.forksOnly),
          mine: bool(args.mine),
          cursor: str(args.cursor) ?? null,
          limit: num(args.limit),
        },
        origin,
      ),
  },
  {
    name: "get_widget",
    description:
      "Get a single widget's full definition by slug: source code, args schema, metadata, and embed URL.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: { slug: { type: "string" } },
    },
    run: (user, args, origin) => getWidgetOp(user, String(args.slug), origin),
  },
  {
    name: "create_widget",
    description:
      "Create a new widget. Source must define `function Widget(props) { return <jsx/> }` using inline styles (Satori/Tailwind subset). New widgets default to PRIVATE.",
    inputSchema: {
      type: "object",
      required: ["name", "source"],
      properties: {
        name: { type: "string" },
        source: { type: "string" },
        description: { type: "string" },
        type: WIDGET_TYPE_SCHEMA,
        visibility: VISIBILITY_SCHEMA,
        argsSchema: ARGS_SCHEMA_SCHEMA,
      },
    },
    run: (user, args, origin) => createWidgetOp(user, args, origin),
  },
  {
    name: "update_widget",
    description:
      "Update an owned widget. Only the fields you pass change; omitted fields are kept. Purges the render cache so embeds refresh.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: {
        slug: { type: "string" },
        name: { type: "string" },
        source: { type: "string" },
        description: { type: "string" },
        type: WIDGET_TYPE_SCHEMA,
        visibility: VISIBILITY_SCHEMA,
        argsSchema: ARGS_SCHEMA_SCHEMA,
      },
    },
    run: (user, args, origin) =>
      updateWidgetOp(user, String(args.slug), args, origin),
  },
  {
    name: "fork_widget",
    description:
      "Fork a widget into a new private copy that you own. Optionally set the new name.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: {
        slug: { type: "string" },
        name: { type: "string" },
      },
    },
    run: (user, args, origin) =>
      forkWidgetOp(user, String(args.slug), str(args.name), origin),
  },
  {
    name: "set_widget_visibility",
    description: "Set an owned widget's visibility to PUBLIC or PRIVATE.",
    inputSchema: {
      type: "object",
      required: ["slug", "visibility"],
      properties: { slug: { type: "string" }, visibility: VISIBILITY_SCHEMA },
    },
    run: (user, args, origin) =>
      setVisibilityOp(user, String(args.slug), args.visibility, origin),
  },
  {
    name: "delete_widget",
    description:
      "Delete an owned widget. Its instances stop rendering (tombstone) and forks keep a dangling reference.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: { slug: { type: "string" } },
    },
    run: (user, args) => deleteWidgetOp(user, String(args.slug)),
  },
  {
    name: "list_instances",
    description:
      "List your user/repo widget instances with their embed URLs and bound targets.",
    inputSchema: { type: "object", properties: {} },
    run: (user, _args, origin) => listInstancesOp(user, origin),
  },
  {
    name: "create_instance",
    description:
      "Create an instance of a USER or REPO widget bound to a git target, then return its embed URL. Requires a connected git token (Settings) to render live data. For REPO widgets pass both targetLogin (owner) and targetRepo.",
    inputSchema: {
      type: "object",
      required: ["slug", "targetLogin"],
      properties: {
        slug: { type: "string" },
        targetLogin: { type: "string" },
        targetRepo: { type: "string" },
        config: { type: "object" },
      },
    },
    run: (user, args, origin) => createInstanceOp(user, args, origin),
  },
  {
    name: "delete_instance",
    description: "Delete one of your instances by id.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
    run: (user, args) => deleteInstanceOp(user, String(args.id)),
  },
];

const TOOLS_BY_NAME = new Map(TOOLS.map((tool) => [tool.name, tool]));

export const MCP_TOOL_SUMMARIES: { name: string; description: string }[] =
  TOOLS.map(({ name, description }) => ({ name, description }));

function toolList() {
  return TOOLS.map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema,
  }));
}

interface RpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: JsonObject;
}

function rpcResult(id: RpcRequest["id"], result: unknown): Response {
  return jsonResponse({ jsonrpc: "2.0", id: id ?? null, result });
}

function rpcError(
  id: RpcRequest["id"],
  code: number,
  message: string,
  status = 200,
): Response {
  return jsonResponse(
    { jsonrpc: "2.0", id: id ?? null, error: { code, message } },
    status,
  );
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

interface ToolOutcome {
  text: string;
  isError: boolean;
}

async function callTool(
  user: SessionUser,
  origin: string,
  params: JsonObject | undefined,
): Promise<ToolOutcome> {
  const name = typeof params?.name === "string" ? params.name : "";
  const tool = TOOLS_BY_NAME.get(name);
  if (!tool) {
    return { text: `Unknown tool: ${name || "(none)"}`, isError: true };
  }
  const args =
    params?.arguments && typeof params.arguments === "object"
      ? (params.arguments as JsonObject)
      : {};
  try {
    const result = await tool.run(user, args, origin);
    return { text: JSON.stringify(result, null, 2), isError: false };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tool execution failed.";
    return { text: message, isError: true };
  }
}

export async function handleMcp(
  request: Request,
  origin: string,
): Promise<Response> {
  if (request.method === "GET" || request.method === "DELETE") {
    return new Response(null, { status: 405, headers: { allow: "POST" } });
  }
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { allow: "POST" } });
  }

  const user = await authenticateApiKey(request);
  if (!user) {
    return rpcError(
      null,
      -32001,
      "Unauthorized: provide a gita API key via the Authorization header.",
      401,
    );
  }

  let message: RpcRequest;
  try {
    message = (await request.json()) as RpcRequest;
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const { id, method, params } = message;
  const isNotification = id === undefined || id === null;

  switch (method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion:
          typeof params?.protocolVersion === "string"
            ? params.protocolVersion
            : PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
    case "notifications/initialized":
    case "notifications/cancelled":
      return new Response(null, { status: 202 });
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, { tools: toolList() });
    case "tools/call": {
      const outcome = await callTool(user, origin, params);
      return rpcResult(id, {
        content: [{ type: "text", text: outcome.text }],
        isError: outcome.isError,
      });
    }
    default:
      if (isNotification) return new Response(null, { status: 202 });
      return rpcError(id, -32601, `Method not found: ${method}`);
  }
}
