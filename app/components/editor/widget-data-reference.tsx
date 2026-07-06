import { CodeIcon } from "lucide-react";
import { CopyButton } from "~/components/copy-button";
import type { WidgetType } from "~/lib/widget";
import {
  GIT_REPO_FIELDS,
  GIT_USER_FIELDS,
  WIDGET_RUNTIME_TYPES,
} from "~/services/widget-runtime";

interface WidgetDataReferenceProps {
  type: WidgetType;
}

export function WidgetDataReference({ type }: WidgetDataReferenceProps) {
  if (type === "GENERIC") {
    return (
      <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
        Generic widgets receive only the arguments defined in the Arguments tab.
      </div>
    );
  }

  const isUser = type === "USER";
  const prop = isUser ? "data.user" : "data.repo";
  const fields = isUser ? GIT_USER_FIELDS : GIT_REPO_FIELDS;
  const snippet = isUser
    ? "function Widget({ accent, data }: { accent: string; data: { user: GitUser } }) {\n  const user = data.user;\n  return <div>{user.login}</div>;\n}"
    : "function Widget({ accent, data }: { accent: string; data: { repo: GitRepo } }) {\n  const repo = data.repo;\n  return <div>{repo.fullName}</div>;\n}";

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <CodeIcon className="size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium">{prop}</p>
            <p className="truncate text-xs text-muted-foreground">
              Injected into previews and real instance renders.
            </p>
          </div>
        </div>
        <CopyButton
          value={`${WIDGET_RUNTIME_TYPES}\n\n${snippet}`}
          label="Types"
        />
      </div>

      <div className="max-h-56 overflow-auto rounded-md border">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-muted text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 font-medium">Field</th>
              <th className="px-2 py-1.5 font-medium">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fields.map(([name, fieldType]) => (
              <tr key={name}>
                <td className="px-2 py-1.5 font-mono">{name}</td>
                <td className="px-2 py-1.5 font-mono text-muted-foreground">
                  {fieldType}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
