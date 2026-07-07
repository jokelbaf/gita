import {
  apiError,
  apiJson,
  apiOrigin,
  methodNotAllowed,
  readJson,
  requireApiUser,
} from "~/services/api/http.server";
import { setVisibilityOp } from "~/services/api/operations.server";
import type { Route } from "./+types/api-v1-widget-visibility";

export async function action({ request, params }: Route.ActionArgs) {
  try {
    if (request.method !== "PUT" && request.method !== "POST") {
      return methodNotAllowed("PUT");
    }
    const user = await requireApiUser(request);
    const body = await readJson(request);
    return apiJson(
      await setVisibilityOp(user, params.slug, body.visibility, apiOrigin()),
    );
  } catch (error) {
    return apiError(error);
  }
}
