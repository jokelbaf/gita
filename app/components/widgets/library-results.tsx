import { useEffect, useRef, useState } from "react";
import { useFetcher, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import type { WidgetCard as WidgetCardData } from "~/lib/widget";
import { WidgetGrid } from "./widget-grid";

interface PageData {
  widgets: WidgetCardData[];
  nextCursor: string | null;
}

interface LibraryResultsProps {
  firstPage: WidgetCardData[];
  firstCursor: string | null;
}

export function LibraryResults({
  firstPage,
  firstCursor,
}: LibraryResultsProps) {
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher<PageData>();
  const [extra, setExtra] = useState<WidgetCardData[]>([]);
  const [cursor, setCursor] = useState(firstCursor);
  const appliedRef = useRef<PageData | null>(null);

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data &&
      appliedRef.current !== fetcher.data
    ) {
      appliedRef.current = fetcher.data;
      const page = fetcher.data;
      setExtra((prev) => [...prev, ...page.widgets]);
      setCursor(page.nextCursor);
    }
  }, [fetcher.state, fetcher.data]);

  function loadMore() {
    if (!cursor) return;
    const params = new URLSearchParams(searchParams);
    params.set("cursor", cursor);
    fetcher.load(`/widgets?${params.toString()}`);
  }

  const widgets = [...firstPage, ...extra];
  const loading = fetcher.state === "loading";

  return (
    <div className="space-y-8">
      <WidgetGrid widgets={widgets} />
      {cursor ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
