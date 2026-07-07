import {
  createApiKey,
  revokeApiKey,
  type CreatedApiKey,
} from "~/services/api-keys.server";
import { userContext } from "~/services/context";
import { requireUser } from "~/services/session.server";
import type { Route } from "./+types/api-keys";

export interface ApiKeyActionResult {
  ok: boolean;
  /** The freshly minted key, returned once so the UI can reveal it. */
  created: CreatedApiKey | null;
}

export async function action({
  request,
  context,
}: Route.ActionArgs): Promise<ApiKeyActionResult> {
  const user = requireUser(context.get(userContext), request);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "create") {
    const created = await createApiKey(user.id, String(form.get("name") ?? ""));
    return { ok: true, created };
  }
  if (intent === "revoke") {
    await revokeApiKey(user.id, String(form.get("id") ?? ""));
    return { ok: true, created: null };
  }
  return { ok: false, created: null };
}
