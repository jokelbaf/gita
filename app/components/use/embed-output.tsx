import { CopyButton } from "~/components/copy-button";
import { Label } from "~/components/ui/label";
import { WidgetPreview } from "~/components/widgets/widget-preview";
import { widgetMarkdown } from "~/lib/widget";

interface EmbedOutputProps {
  name: string;
  /** App-relative render URL, e.g. /api/widget/public/slug?text=Hi */
  path: string;
}

export function EmbedOutput({ name, path }: EmbedOutputProps) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}${path}`;
  const markdown = widgetMarkdown(name, url);

  return (
    <div className="space-y-4">
      <WidgetPreview
        src={path}
        alt={`${name} preview`}
        className="min-h-40 rounded-lg ring-1 ring-foreground/10"
      />

      <CopyRow label="Image URL" value={url} />
      <CopyRow label="README markdown" value={markdown} />
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs">
          {value}
        </code>
        <CopyButton value={value} toastMessage={`${label} copied`} />
      </div>
    </div>
  );
}
