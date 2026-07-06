import { lazy, Suspense, useSyncExternalStore } from "react";
import type { Theme } from "~/lib/theme";
import { cn } from "~/lib/utils";

const CodeMirrorView = lazy(() => import("./codemirror-view"));

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
  className?: string;
}

function Fallback({ value, className }: { value: string; className?: string }) {
  return (
    <pre
      className={cn(
        "h-full overflow-auto p-3 font-mono text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {value}
    </pre>
  );
}

const noop = () => () => {};

export function CodeEditor({
  value,
  onChange,
  theme,
  className,
}: CodeEditorProps) {
  // True only after client hydration - CodeMirror can't render during SSR.
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  if (!mounted) return <Fallback value={value} className={className} />;

  return (
    <Suspense fallback={<Fallback value={value} className={className} />}>
      <CodeMirrorView
        value={value}
        onChange={onChange}
        theme={theme}
        className={cn("h-full text-[13px]", className)}
      />
    </Suspense>
  );
}
