import { CheckCircle2Icon } from "lucide-react";
import type { TargetType } from "~/generated/prisma/enums";
import { EmbedOutput } from "./embed-output";

export function InstanceEmbed({
  instanceId,
  type,
  name,
  target,
}: {
  instanceId: string;
  type: TargetType;
  name: string;
  target: string;
}) {
  const path = `/api/widget/${type === "REPO" ? "repo" : "user"}/${instanceId}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400">
        <CheckCircle2Icon className="size-4 shrink-0" />
        Instance created for <span className="font-medium">{target}</span> -
        drop it into any README.
      </div>
      <EmbedOutput name={name} path={path} />
    </div>
  );
}
