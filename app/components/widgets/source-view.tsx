import { CopyButton } from "~/components/copy-button";

interface SourceViewProps {
  html: string;
  raw: string;
}

export function SourceView({ html, raw }: SourceViewProps) {
  return (
    <div className="source-view overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          Widget.tsx
        </span>
        <CopyButton value={raw} label="Copy" />
      </div>
      <div
        className="max-h-130 overflow-auto p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
