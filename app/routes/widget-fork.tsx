import { redirect } from "react-router";
import { userContext } from "~/services/context";
import { toErrorResponse } from "~/services/errors";
import { loginRedirect } from "~/services/session.server";
import { forkWidget } from "~/services/widget-editor.server";
import type { Route } from "./+types/widget-fork";

export async function action({ params, request, context }: Route.ActionArgs) {
  const user = context.get(userContext);
  if (!user) throw redirect(loginRedirect(request));

  const form = await request.formData();
  const name = String(form.get("name") ?? "");
  try {
    const slug = await forkWidget(params.slug, user.id, name);
    return redirect(`/widgets/${slug}/edit`);
  } catch (error) {
    throw toErrorResponse(error);
  }
}
