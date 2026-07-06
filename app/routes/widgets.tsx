import { PackageOpenIcon } from "lucide-react";
import { useNavigation, useSearchParams } from "react-router";
import { LibraryControls } from "~/components/widgets/library-controls";
import { LibraryResults } from "~/components/widgets/library-results";
import { NewWidgetButton } from "~/components/widgets/new-widget-button";
import { WidgetGridSkeleton } from "~/components/widgets/widget-grid";
import { Button } from "~/components/ui/button";
import {
  SORT_OPTIONS,
  TYPE_OPTIONS,
  type SortKey,
  type TypeFilter,
} from "~/lib/widget";
import { userContext } from "~/services/context";
import { listWidgets } from "~/services/widgets.server";
import type { Route } from "./+types/widgets";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Library - gita" },
    {
      name: "description",
      content: "Browse and configure community-built widgets for your README.",
    },
  ];
}

function parseType(value: string | null): TypeFilter {
  return TYPE_OPTIONS.some((option) => option.value === value)
    ? (value as TypeFilter)
    : "all";
}

function parseSort(value: string | null): SortKey {
  return SORT_OPTIONS.some((option) => option.value === value)
    ? (value as SortKey)
    : "popular";
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = context.get(userContext);
  const url = new URL(request.url);
  const sp = url.searchParams;

  const { widgets, nextCursor } = await listWidgets({
    viewerId: user?.id ?? null,
    search: sp.get("q") ?? undefined,
    type: parseType(sp.get("type")),
    forksOnly: sp.get("forks") === "1",
    sort: parseSort(sp.get("sort")),
    cursor: sp.get("cursor"),
  });

  return { widgets, nextCursor };
}

export default function Widgets({ loaderData }: Route.ComponentProps) {
  const { widgets, nextCursor } = loaderData;
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const isFiltering =
    navigation.state === "loading" &&
    navigation.location?.pathname === "/widgets" &&
    !new URLSearchParams(navigation.location.search).has("cursor");

  const hasFilters =
    searchParams.has("q") ||
    searchParams.has("type") ||
    searchParams.has("forks") ||
    searchParams.get("sort") === "trending" ||
    searchParams.get("sort") === "newest";

  const resetKey = [
    searchParams.get("q") ?? "",
    searchParams.get("type") ?? "",
    searchParams.get("sort") ?? "",
    searchParams.get("forks") ?? "",
  ].join("|");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Widget library</h1>
          <p className="max-w-2xl text-muted-foreground">
            Browse community-built widgets, then configure one and drop it into
            any README as an image.
          </p>
        </div>
        <NewWidgetButton />
      </header>

      <div className="mt-8">
        <LibraryControls />
      </div>

      <div className="mt-8">
        {isFiltering ? (
          <WidgetGridSkeleton />
        ) : widgets.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <LibraryResults
            key={resetKey}
            firstPage={widgets}
            firstCursor={nextCursor}
          />
        )}
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  const [, setSearchParams] = useSearchParams();
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <PackageOpenIcon className="size-6" />
      </div>
      <p className="text-sm font-medium">No widgets found</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "No widgets match these filters. Try widening your search."
          : "There aren’t any widgets to show yet."}
      </p>
      {hasFilters ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchParams({}, { replace: true })}
        >
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}
