import { KeyRoundIcon, Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { CopyButton } from "~/components/copy-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { formatDate } from "~/lib/format";
import type { ApiKeyActionResult } from "~/routes/api-keys";
import type { ApiKeySummary } from "~/services/api-keys.server";

export function ApiKeysPanel({ keys }: { keys: ApiKeySummary[] }) {
  const fetcher = useFetcher<ApiKeyActionResult>();
  const [name, setName] = useState("");
  const creating =
    fetcher.state !== "idle" && fetcher.formData?.get("intent") === "create";
  const justCreated = fetcher.data?.created ?? null;

  function create() {
    fetcher.submit(
      { intent: "create", name },
      { method: "post", action: "/resource/api-keys" },
    );
    setName("");
  }

  return (
    <div className="space-y-5 rounded-xl border p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <KeyRoundIcon className="size-5" />
        </div>
        <div>
          <p className="font-medium">API keys</p>
          <p className="text-sm text-muted-foreground">
            Authenticate the REST API and MCP server so an AI or script can act
            as you. Treat a key like a password.
          </p>
        </div>
      </div>

      {justCreated ? (
        <div className="space-y-2 rounded-lg border border-emerald-300/50 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            Copy your new key now - it won’t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md bg-background px-2.5 py-1.5 font-mono text-xs">
              {justCreated.key}
            </code>
            <CopyButton value={justCreated.key} toastMessage="API key copied" />
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Key name (e.g. “Claude Desktop”)"
          maxLength={60}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              create();
            }
          }}
        />
        <Button onClick={create} disabled={creating} className="shrink-0">
          {creating ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
          Create key
        </Button>
      </div>

      {keys.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{key.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  gita_••••{key.last4} · created {formatDate(key.createdAt)}
                  {key.lastUsedAt
                    ? ` · last used ${formatDate(key.lastUsedAt)}`
                    : " · never used"}
                </p>
              </div>
              <RevokeButton id={key.id} name={key.name} fetcher={fetcher} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No API keys yet.</p>
      )}
    </div>
  );
}

function RevokeButton({
  id,
  name,
  fetcher,
}: {
  id: string;
  name: string;
  fetcher: ReturnType<typeof useFetcher<ApiKeyActionResult>>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Revoke ${name}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <TrashIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke “{name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Any AI or script using this key will immediately lose access. This
            can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
            onClick={() =>
              fetcher.submit(
                { intent: "revoke", id },
                { method: "post", action: "/resource/api-keys" },
              )
            }
          >
            Revoke key
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
