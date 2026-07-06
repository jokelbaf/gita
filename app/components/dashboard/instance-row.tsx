import { FolderGitIcon, UserIcon } from "lucide-react";
import { Link } from "react-router";
import { CopyButton } from "~/components/copy-button";
import { TypeBadge } from "~/components/widgets/type-badge";
import { WidgetPreview } from "~/components/widgets/widget-preview";
import { formatDate } from "~/lib/format";
import type { InstanceListItem } from "~/services/instances.server";
import { RevokeInstanceDialog } from "./revoke-instance-dialog";

export function InstanceRow({ instance }: { instance: InstanceListItem }) {
  const path = `/api/widget/${instance.targetType === "REPO" ? "repo" : "user"}/${instance.id}`;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}${path}`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center">
      <WidgetPreview
        src={path}
        alt={`${instance.widgetName} instance preview`}
        className="h-24 w-full shrink-0 rounded-lg ring-1 ring-foreground/10 sm:w-44"
      />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/widgets/${instance.widgetSlug}`}
            className="font-medium hover:underline"
          >
            {instance.widgetName}
          </Link>
          <TypeBadge type={instance.widgetType} />
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            {instance.targetType === "REPO" ? (
              <FolderGitIcon className="size-3.5" />
            ) : (
              <UserIcon className="size-3.5" />
            )}
            {instance.targetLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs">
            {url}
          </code>
          <CopyButton value={url} toastMessage="Embed URL copied" />
        </div>

        <p className="text-xs text-muted-foreground">
          Created {formatDate(instance.createdAt)}
        </p>
      </div>

      <div className="shrink-0">
        <RevokeInstanceDialog
          instanceId={instance.id}
          target={instance.targetLabel}
        />
      </div>
    </div>
  );
}
