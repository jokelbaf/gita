import { userContext } from "~/services/context";
import { AppError } from "~/services/errors";
import {
  getCredentialSummary,
  listUserRepos,
  type CredentialSummary,
  type GitRepoRef,
} from "~/services/git/index.server";
import { createInstance, deleteInstance } from "~/services/instances.server";
import type { Route } from "./+types/instances";

export interface UseContext {
  credential: CredentialSummary | null;
  repos: GitRepoRef[] | null;
  reposError: string | null;
}

export interface InstanceCreateResult {
  ok?: boolean;
  id?: string;
  type?: "USER" | "REPO";
  target?: string;
  error?: string;
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = context.get(userContext);
  if (!user) {
    return Response.json({ error: "Sign in first." }, { status: 401 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const credential = await getCredentialSummary(user.id);

  let repos: GitRepoRef[] | null = null;
  let reposError: string | null = null;
  if (type === "REPO" && credential && credential.status === "active") {
    const result = await listUserRepos(user.id);
    if (result.status === "ok") repos = result.repos;
    else if (result.status === "error") reposError = result.message;
    else reposError = "Your git token needs reconnecting.";
  }

  return Response.json({
    credential,
    repos,
    reposError,
  } satisfies UseContext);
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = context.get(userContext);
  if (!user) {
    return Response.json({ error: "Sign in first." }, { status: 401 });
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  try {
    if (intent === "create") {
      let config: Record<string, unknown> = {};
      const rawConfig = form.get("config");
      if (typeof rawConfig === "string" && rawConfig) {
        try {
          config = JSON.parse(rawConfig) as Record<string, unknown>;
        } catch {
          config = {};
        }
      }
      const created = await createInstance(user.id, {
        slug: String(form.get("slug") ?? ""),
        targetLogin: String(form.get("targetLogin") ?? ""),
        targetRepo: form.get("targetRepo")
          ? String(form.get("targetRepo"))
          : null,
        config,
      });
      return Response.json({ ok: true, ...created });
    }

    if (intent === "delete") {
      await deleteInstance(user.id, String(form.get("instanceId") ?? ""));
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown intent." }, { status: 400 });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    const message =
      error instanceof AppError ? error.message : "Something went wrong.";
    return Response.json({ error: message }, { status });
  }
}
