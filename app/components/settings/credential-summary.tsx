import { CheckCircle2Icon, RefreshCwIcon, XCircleIcon } from "lucide-react";
import { useSubmit } from "react-router";
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
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { formatDate } from "~/lib/format";
import type { CredentialSummary } from "~/services/git/index.server";

const STATUS_META: Record<
  CredentialSummary["status"],
  { label: string; className: string; icon: typeof CheckCircle2Icon }
> = {
  active: {
    label: "Valid",
    className:
      "border-emerald-300 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400",
    icon: CheckCircle2Icon,
  },
  invalid: {
    label: "Invalid - reconnect",
    className:
      "border-destructive/40 text-destructive dark:border-destructive/50",
    icon: XCircleIcon,
  },
  expired: {
    label: "Expired - reconnect",
    className:
      "border-amber-300 text-amber-700 dark:border-amber-900 dark:text-amber-400",
    icon: XCircleIcon,
  },
};

export function CredentialSummaryCard({
  credential,
  onReplace,
}: {
  credential: CredentialSummary;
  onReplace: () => void;
}) {
  const submit = useSubmit();
  const status = STATUS_META[credential.status];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-5 rounded-xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <StatusIcon className="size-5" />
          </div>
          <div>
            <p className="font-medium">
              {credential.provider} · @{credential.accountLogin || "unknown"}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              ••••{credential.last4}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={status.className}>
          {status.label}
        </Badge>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Row label="Base URL" value={credential.baseUrl} />
        <Row label="Validated" value={formatDate(credential.validatedAt)} />
        <Row
          label="Expires"
          value={
            credential.expiresAt
              ? formatDate(credential.expiresAt)
              : "No expiry"
          }
        />
        <Row
          label="Scopes"
          value={credential.scopes.length ? credential.scopes.join(", ") : "-"}
        />
      </dl>

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={onReplace}>
          <RefreshCwIcon />
          Replace token
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Remove token
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this token?</AlertDialogTitle>
              <AlertDialogDescription>
                Your user and repo widget instances will stop rendering live
                data and show a “reconnect your token” image until you add a new
                one.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                onClick={() => submit({ intent: "remove" }, { method: "post" })}
              >
                Remove token
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words">{value}</dd>
    </div>
  );
}
