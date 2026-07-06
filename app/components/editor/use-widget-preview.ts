import { useEffect, useRef, useState } from "react";
import type { ResolvedArgs, WidgetArg } from "~/services/args";
import type { WidgetType } from "~/lib/widget";

export interface PreviewError {
  stage?: string;
  message: string;
  issues?: { name?: string; path?: string; message: string }[];
}

export interface PreviewState {
  status: "idle" | "loading" | "ok" | "error";
  svg?: string;
  error?: PreviewError;
}

interface PreviewRequest {
  source: string;
  argsSchema: WidgetArg[];
  args: ResolvedArgs;
  type: WidgetType;
}

const DEBOUNCE_MS = 450;

export function useWidgetPreview(request: PreviewRequest): PreviewState {
  const [state, setState] = useState<PreviewState>({ status: "idle" });

  const key = JSON.stringify(request);
  const latest = useRef(0);

  useEffect(() => {
    const runId = ++latest.current;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setState((prev) => ({ ...prev, status: "loading" }));
      try {
        const res = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: key,
          signal: controller.signal,
        });
        if (runId !== latest.current) return;
        if (res.ok) {
          setState({ status: "ok", svg: await res.text() });
        } else {
          const err = (await res
            .json()
            .catch(() => null)) as PreviewError | null;
          setState({
            status: "error",
            error: err ?? { message: "The preview request failed." },
          });
        }
      } catch (error) {
        if (runId !== latest.current) return;
        if ((error as Error).name === "AbortError") return;
        setState({ status: "error", error: { message: "Network error." } });
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [key]);

  return state;
}
