import {
  apiError,
  apiJson,
  apiOrigin,
  methodNotAllowed,
  readJson,
  requireApiUser,
} from "~/services/api/http.server";
import { forkWidgetOp } from "~/services/api/operations.server";
import type { Route } from "./+types/api-v1-widget-fork";

export async function action({ request, params }: Route.ActionArgs) {
  try {
    if (request.method !== "POST") return methodNotAllowed("POST");
    const user = await requireApiUser(request);
    const body = await readJson(request);
    const name = typeof body.name === "string" ? body.name : undefined;
    return apiJson(
      await forkWidgetOp(user, params.slug, name, apiOrigin()),
      201,
    );
  } catch (error) {
    return apiError(error);
  }
}
