import { widgetPreviewUrl } from "~/lib/widget";
import { WidgetPreview } from "~/components/widgets/widget-preview";

interface EditorShowcaseProps {
  slug: string;
  name: string;
  sourceHtml: string;
}

export function EditorShowcase({
  slug,
  name,
  sourceHtml,
}: EditorShowcaseProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <div className="source-view flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="size-3 rounded-full bg-red-400/70" />
            <span className="size-3 rounded-full bg-yellow-400/70" />
            <span className="size-3 rounded-full bg-green-400/70" />
          </span>
          <span className="ml-1 font-mono text-xs text-muted-foreground">
            Widget.tsx
          </span>
        </div>
        <div
          className="max-h-88 flex-1 overflow-auto p-4"
          dangerouslySetInnerHTML={{ __html: sourceHtml }}
        />
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2.5">
          <span className="text-xs font-medium text-muted-foreground">
            Live render
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            SVG · always fresh
          </span>
        </div>
        <WidgetPreview
          src={widgetPreviewUrl(slug)}
          alt={`${name} preview`}
          className="min-h-72 flex-1"
          padded
        />
      </div>
    </div>
  );
}
