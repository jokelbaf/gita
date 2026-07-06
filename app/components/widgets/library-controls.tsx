import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import {
  SORT_OPTIONS,
  TYPE_OPTIONS,
  type SortKey,
  type TypeFilter,
} from "~/lib/widget";

const DEBOUNCE_MS = 300;

export function LibraryControls() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [term, setTerm] = useState(() => searchParams.get("q") ?? "");

  const type = (searchParams.get("type") as TypeFilter | null) ?? "all";
  const sort = (searchParams.get("sort") as SortKey | null) ?? "popular";
  const forksOnly = searchParams.get("forks") === "1";

  function setParam(key: string, value: string | null) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        next.delete("cursor");
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (term === current) return;
    const id = setTimeout(
      () => setParam("q", term.trim() || null),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search widgets…"
          className="pl-9"
          aria-label="Search widgets"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={type}
          onValueChange={(value) =>
            setParam("type", value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[140px]" aria-label="Filter by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(value) =>
            setParam("sort", value === "popular" ? null : value)
          }
        >
          <SelectTrigger className="w-[130px]" aria-label="Sort widgets">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Label className="flex cursor-pointer items-center gap-2 text-sm whitespace-nowrap text-muted-foreground">
          <Switch
            checked={forksOnly}
            onCheckedChange={(checked) =>
              setParam("forks", checked ? "1" : null)
            }
          />
          Forks only
        </Label>
      </div>
    </div>
  );
}
