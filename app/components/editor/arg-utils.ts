import type { ArgType, ArgValue, WidgetArg } from "~/services/args";

export const ARG_TYPE_OPTIONS: { value: ArgType; label: string }[] = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "enum", label: "Enum" },
  { value: "color", label: "Color" },
];

export function defaultForType(type: ArgType, options?: string[]): ArgValue {
  switch (type) {
    case "number":
      return 0;
    case "boolean":
      return false;
    case "enum":
      return options?.[0] ?? "";
    case "color":
      return "#6366f1";
    default:
      return "";
  }
}

export function newArg(existing: WidgetArg[]): WidgetArg {
  let n = existing.length + 1;
  const names = new Set(existing.map((a) => a.name));
  while (names.has(`arg${n}`)) n += 1;
  return {
    name: `arg${n}`,
    label: `Argument ${n}`,
    type: "string",
    default: "",
    required: false,
    description: "",
  };
}

export function retypeArg(arg: WidgetArg, type: ArgType): WidgetArg {
  const base: WidgetArg = {
    name: arg.name,
    label: arg.label,
    type,
    required: arg.required,
    description: arg.description,
    default: defaultForType(type, arg.options),
  };
  if (type === "enum")
    base.options = arg.options?.length ? arg.options : ["one"];
  return base;
}
