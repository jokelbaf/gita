import {
  apiError,
  apiJson,
  apiOrigin,
  methodNotAllowed,
  readJson,
  requireApiUser,
} from "~/services/api/http.server";
import {
  deleteWidgetOp,
  getWidgetOp,
  updateWidgetOp,
} from "~/services/api/operations.server";
import type { Route } from "./+types/api-v1-widget";

export async function loader({ request, params }: Route.LoaderArgs) {
  try {
    const user = await requireApiUser(request);
    return apiJson(await getWidgetOp(user, params.slug, apiOrigin()));
  } catch (error) {
    return apiError(error);
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  try {
    const user = await requireApiUser(request);
    if (request.method === "PATCH" || request.method === "PUT") {
      const body = await readJson(request);
      return apiJson(
        await updateWidgetOp(user, params.slug, body, apiOrigin()),
      );
    }
    if (request.method === "DELETE") {
      return apiJson(await deleteWidgetOp(user, params.slug));
    }
    return methodNotAllowed("GET, PATCH, DELETE");
  } catch (error) {
    return apiError(error);
  }
}
