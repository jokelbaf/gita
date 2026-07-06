import { useMemo, useState } from "react";
import type { ArgValue, ResolvedArgs, WidgetArg } from "~/services/args";

export function useArgConfig(schema: WidgetArg[]) {
  const [overrides, setOverrides] = useState<Record<string, ArgValue>>({});

  const values = useMemo<ResolvedArgs>(() => {
    const out: ResolvedArgs = {};
    for (const arg of schema)
      out[arg.name] = overrides[arg.name] ?? arg.default;
    return out;
  }, [schema, overrides]);

  const setValue = (name: string, value: ArgValue) =>
    setOverrides((prev) => ({ ...prev, [name]: value }));

  return { values, setValue };
}
