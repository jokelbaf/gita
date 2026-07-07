import { ApiKeysPanel } from "~/components/settings/api-keys-panel";
import { SettingsPanel } from "~/components/settings/settings-panel";
import { listApiKeys } from "~/services/api-keys.server";
import { userContext } from "~/services/context";
import {
  getCredentialSummary,
  removeCredential,
  saveCredential,
  type GitProviderId,
} from "~/services/git/index.server";
import { requireUser } from "~/services/session.server";
import type { Route } from "./+types/settings";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Settings - gita" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = requireUser(context.get(userContext), request);
  const [credential, apiKeys] = await Promise.all([
    getCredentialSummary(user.id),
    listApiKeys(user.id),
  ]);
  return { credential, apiKeys };
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = requireUser(context.get(userContext), request);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "remove") {
    await removeCredential(user.id);
    return { ok: true as const };
  }

  if (intent === "save") {
    const result = await saveCredential(user.id, {
      provider: (String(form.get("provider") ?? "GITHUB") ||
        "GITHUB") as GitProviderId,
      baseUrl: String(form.get("baseUrl") ?? "https://github.com").trim(),
      token: String(form.get("token") ?? ""),
    });
    if (!result.ok) return { ok: false as const, error: result.error };
    return {
      ok: true as const,
      warnings: result.validation.warnings ?? [],
    };
  }

  return { ok: false as const, error: "Unknown action." };
}

export default function Settings({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { credential, apiKeys } = loaderData;
  const warnings =
    actionData && actionData.ok && "warnings" in actionData
      ? (actionData.warnings ?? [])
      : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="max-w-2xl text-muted-foreground">
          Connect a git access token so your user and repo widgets can read live
          data. It’s validated on save, encrypted at rest, and never shown
          again.
        </p>
      </header>

      <section className="mt-8 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Git connection
        </h2>
        {/* Remount on save (validatedAt changes) so the panel resets to the
            fresh summary; a failed save leaves it on the form with its error. */}
        <SettingsPanel
          key={credential?.validatedAt ?? "none"}
          credential={credential}
          error={actionData && !actionData.ok ? actionData.error : undefined}
          warnings={warnings}
        />
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Programmatic access
        </h2>
        <ApiKeysPanel keys={apiKeys} />
      </section>
    </div>
  );
}
