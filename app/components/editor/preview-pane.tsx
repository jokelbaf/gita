import { AlertTriangleIcon, Loader2Icon } from "lucide-react";
import type { PreviewState } from "./use-widget-preview";

const STAGE_LABEL: Record<string, string> = {
  compile: "Compile error",
  timeout: "Timed out",
  memory: "Out of memory",
  runtime: "Runtime error",
  output: "Invalid output",
  render: "Render error",
  schema: "Schema error",
  args: "Argument error",
  rate_limited: "Slow down",
  request: "Bad request",
};

function ErrorCard({ error }: { error: NonNullable<PreviewState["error"]> }) {
  const title = error.stage ? (STAGE_LABEL[error.stage] ?? "Error") : "Error";
  return (
    <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangleIcon className="size-4 shrink-0" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <p className="mt-2 font-mono text-xs break-words text-destructive/90">
        {error.message}
      </p>
      {error.issues && error.issues.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-destructive/80">
          {error.issues.map((issue, i) => (
            <li key={i}>
              <span className="font-medium">
                {issue.name ?? issue.path ?? "arg"}
              </span>
              : {issue.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function PreviewPane({ state }: { state: PreviewState }) {
  const showError = state.status === "error" && state.error;
  const showSvg = state.svg && !showError;

  return (
    <div className="relative flex h-full min-h-64 items-center justify-center overflow-auto p-6">
      {state.status === "loading" ? (
        <div className="absolute top-3 right-3 z-10 text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
        </div>
      ) : null}

      {showError ? (
        <ErrorCard error={state.error!} />
      ) : showSvg ? (
        <div
          className="flex max-w-full items-center justify-center [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: state.svg! }}
        />
      ) : state.status === "idle" || state.status === "loading" ? (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2Icon className="size-5 animate-spin" />
          <span className="text-xs">Rendering preview…</span>
        </div>
      ) : null}
    </div>
  );
}
