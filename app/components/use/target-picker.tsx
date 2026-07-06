import { AlertTriangleIcon, Loader2Icon, SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFetcher, type FetcherWithComponents } from "react-router";
import { ArgValuesForm } from "~/components/editor/arg-values-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import type { WidgetArg } from "~/services/args";
import type { InstanceCreateResult, UseContext } from "~/routes/instances";
import { ConnectTokenBanner } from "./connect-token-banner";
import { useArgConfig } from "./use-arg-config";

interface TargetPickerProps {
  slug: string;
  type: "USER" | "REPO";
  argsSchema: WidgetArg[];
  defaultLogin: string;
  createFetcher: FetcherWithComponents<InstanceCreateResult>;
}

export function TargetPicker({
  slug,
  type,
  argsSchema,
  defaultLogin,
  createFetcher,
}: TargetPickerProps) {
  const ctx = useFetcher<UseContext>();
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    ctx.load(`/resource/instances?type=${type}`);
  }, [ctx, type]);

  const { values, setValue } = useArgConfig(argsSchema);
  const [login, setLogin] = useState(defaultLogin);
  const [owner, setOwner] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");

  if (!ctx.data || ctx.state === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        Checking your git connection…
      </div>
    );
  }

  const credential = ctx.data.credential;
  if (!credential) return <ConnectTokenBanner reason="missing" />;
  if (credential.status !== "active") {
    return <ConnectTokenBanner reason="invalid" />;
  }

  const creating = createFetcher.state !== "idle";
  const error = createFetcher.data?.error;

  function create(targetLogin: string, targetRepo?: string) {
    createFetcher.submit(
      {
        intent: "create",
        slug,
        targetLogin,
        ...(targetRepo ? { targetRepo } : {}),
        config: JSON.stringify(values),
      },
      { method: "post", action: "/resource/instances" },
    );
  }

  if (type === "USER") {
    const target = login.trim() || credential.accountLogin;
    return (
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="target-login">GitHub user</Label>
          <Input
            id="target-login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder={credential.accountLogin || "octocat"}
          />
          <p className="text-xs text-muted-foreground">
            Defaults to your connected account (@{credential.accountLogin}).
          </p>
        </div>

        <ConfigSection
          schema={argsSchema}
          values={values}
          onChange={setValue}
        />

        <CreateError error={error} />
        <Button disabled={creating || !target} onClick={() => create(target)}>
          {creating ? <Loader2Icon className="animate-spin" /> : null}
          Create instance
        </Button>
      </div>
    );
  }

  const repos = ctx.data.repos ?? [];
  const owners = ["all", ...[...new Set(repos.map((r) => r.owner))].sort()];
  const filtered = repos.filter(
    (r) =>
      (owner === "all" || r.owner === owner) &&
      r.fullName.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function createRepo() {
    const [o, ...rest] = selected.split("/");
    create(o, rest.join("/"));
  }

  return (
    <div className="space-y-5">
      {ctx.data.reposError ? (
        <p className="flex items-center gap-2 rounded-lg border border-amber-300/40 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          <AlertTriangleIcon className="size-4 shrink-0" />
          {ctx.data.reposError}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={owner} onValueChange={setOwner}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {owners.map((o) => (
              <SelectItem key={o} value={o}>
                {o === "all" ? "All owners" : o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search repositories"
            className="pl-8"
          />
        </div>
      </div>

      <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-1">
        {filtered.length === 0 ? (
          <p className="p-4 text-center text-xs text-muted-foreground">
            {repos.length === 0
              ? "No repositories accessible with this token."
              : "No repositories match."}
          </p>
        ) : (
          filtered.slice(0, 100).map((repo) => (
            <button
              key={repo.fullName}
              type="button"
              onClick={() => setSelected(repo.fullName)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                selected === repo.fullName && "bg-muted ring-1 ring-primary/40",
              )}
            >
              <span className="truncate font-medium">{repo.fullName}</span>
              {repo.private ? (
                <span className="rounded bg-muted-foreground/15 px-1 text-[10px] tracking-wide text-muted-foreground uppercase">
                  private
                </span>
              ) : null}
            </button>
          ))
        )}
      </div>

      <ConfigSection schema={argsSchema} values={values} onChange={setValue} />

      <CreateError error={error} />
      <Button disabled={creating || !selected} onClick={createRepo}>
        {creating ? <Loader2Icon className="animate-spin" /> : null}
        {selected ? `Create instance for ${selected}` : "Select a repository"}
      </Button>
    </div>
  );
}

function ConfigSection({
  schema,
  values,
  onChange,
}: {
  schema: WidgetArg[];
  values: ReturnType<typeof useArgConfig>["values"];
  onChange: ReturnType<typeof useArgConfig>["setValue"];
}) {
  if (schema.length === 0) return null;
  return (
    <div className="space-y-3 border-t pt-4">
      <p className="text-xs font-medium text-muted-foreground">Configure</p>
      <ArgValuesForm schema={schema} values={values} onChange={onChange} />
    </div>
  );
}

function CreateError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      <AlertTriangleIcon className="size-4 shrink-0" />
      {error}
    </p>
  );
}
