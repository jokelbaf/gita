import { z } from "zod";

export const ARG_TYPES = [
  "string",
  "number",
  "boolean",
  "enum",
  "color",
] as const;
export type ArgType = (typeof ARG_TYPES)[number];

export interface WidgetArg {
  name: string;
  label: string;
  type: ArgType;
  default: string | number | boolean;
  required: boolean;
  description: string;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
}

export type ArgValue = string | number | boolean;
export type ResolvedArgs = Record<string, ArgValue>;

const IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const COLOR = /^(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})|[a-zA-Z]+)$/;

const argDefinitionSchema = z
  .object({
    name: z.string().regex(IDENTIFIER, "must be a valid identifier"),
    label: z.string().min(1).max(60),
    type: z.enum(ARG_TYPES),
    default: z.union([z.string(), z.number(), z.boolean()]),
    required: z.boolean(),
    description: z.string().max(280).default(""),
    maxLength: z.number().int().positive().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    options: z.array(z.string().min(1)).optional(),
  })
  .superRefine((arg, ctx) => {
    if (arg.type === "enum" && (!arg.options || arg.options.length === 0)) {
      ctx.addIssue({
        code: "custom",
        message: "enum args need at least one option",
        path: ["options"],
      });
    }
  });

export const argsSchemaSchema = z
  .array(argDefinitionSchema)
  .max(20, "a widget can declare at most 20 args")
  .superRefine((args, ctx) => {
    const seen = new Set<string>();
    args.forEach((arg, i) => {
      if (seen.has(arg.name)) {
        ctx.addIssue({
          code: "custom",
          message: `duplicate arg name "${arg.name}"`,
          path: [i, "name"],
        });
      }
      seen.add(arg.name);
    });
  });

export function parseArgsSchema(json: unknown): WidgetArg[] {
  return argsSchemaSchema.parse(json) as WidgetArg[];
}

function coerceBoolean(value: unknown): unknown {
  if (typeof value === "boolean") return value;
  const s = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(s)) return true;
  if (["false", "0", "no", "off"].includes(s)) return false;
  return value; // let zod reject it
}

const blankToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

/**
 * Build a zod field that coerces a raw string/JSON input to a typed arg value.
 * Absent values fall back to the arg's default (so base URLs and default previews
 * always render); a *provided* value that is the wrong type or violates a
 * constraint still fails, producing the error image. `required`
 * is a form-level concern (editor / Use flow), not a render-time one.
 */
function buildField(arg: WidgetArg): z.ZodTypeAny {
  const withDefault = (schema: z.ZodTypeAny): z.ZodTypeAny =>
    schema.optional().default(arg.default);

  switch (arg.type) {
    case "number": {
      let n = z.number({ error: `${arg.label} must be a number` }).finite();
      if (typeof arg.min === "number") n = n.min(arg.min);
      if (typeof arg.max === "number") n = n.max(arg.max);
      return withDefault(
        z.preprocess(
          (v) => (blankToUndefined(v) === undefined ? undefined : Number(v)),
          n,
        ),
      );
    }
    case "boolean":
      return withDefault(z.preprocess(coerceBoolean, z.boolean()));
    case "enum": {
      const options = (arg.options ?? []) as [string, ...string[]];
      return withDefault(z.preprocess(blankToUndefined, z.enum(options)));
    }
    case "color":
      return withDefault(
        z.preprocess(
          (v) => (v === undefined ? undefined : String(v)),
          z.string().regex(COLOR, `${arg.label} must be a color`),
        ),
      );
    default: {
      let s = z.string();
      if (arg.maxLength) s = s.max(arg.maxLength);
      return withDefault(
        z.preprocess((v) => (v === undefined ? undefined : String(v)), s),
      );
    }
  }
}

export function buildArgsValidator(
  schema: WidgetArg[],
): z.ZodType<ResolvedArgs> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const arg of schema) shape[arg.name] = buildField(arg);
  return z.object(shape) as unknown as z.ZodType<ResolvedArgs>;
}

export interface ArgIssue {
  name: string;
  message: string;
}

export type ResolveResult =
  { ok: true; values: ResolvedArgs } | { ok: false; issues: ArgIssue[] };

/**
 * Validate raw inputs (query params or instance config) against a widget's args
 * schema, applying defaults and coercion. Never throws - returns structured
 * issues so the caller can render an error image instead of crashing.
 */
export function resolveArgs(
  schema: WidgetArg[],
  raw: Record<string, unknown>,
): ResolveResult {
  const result = buildArgsValidator(schema).safeParse(raw);
  if (result.success) return { ok: true, values: result.data };
  const issues = result.error.issues.map((issue) => ({
    name: String(issue.path[0] ?? ""),
    message: issue.message,
  }));
  return { ok: false, issues };
}

export function defaultArgs(schema: WidgetArg[]): ResolvedArgs {
  const values: ResolvedArgs = {};
  for (const arg of schema) values[arg.name] = arg.default;
  return values;
}
