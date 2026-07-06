import { ArgValuesForm } from "~/components/editor/arg-values-form";
import type { WidgetArg } from "~/services/args";
import { widgetPreviewUrl } from "~/lib/widget";
import { EmbedOutput } from "./embed-output";
import { useArgConfig } from "./use-arg-config";

interface GenericUseProps {
  slug: string;
  name: string;
  argsSchema: WidgetArg[];
}

export function GenericUse({ slug, name, argsSchema }: GenericUseProps) {
  const { values, setValue } = useArgConfig(argsSchema);

  const params: Record<string, string | number | boolean> = {};
  for (const arg of argsSchema) params[arg.name] = values[arg.name];
  const path = widgetPreviewUrl(slug, params);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-4">
        <p className="text-xs font-medium text-muted-foreground">Configure</p>
        <ArgValuesForm
          schema={argsSchema}
          values={values}
          onChange={setValue}
        />
      </div>
      <div className="space-y-4">
        <p className="text-xs font-medium text-muted-foreground">Embed</p>
        <EmbedOutput name={name} path={path} />
      </div>
    </div>
  );
}
