import {
  apiError,
  apiJson,
  methodNotAllowed,
  requireApiUser,
} from "~/services/api/http.server";
import { deleteInstanceOp } from "~/services/api/operations.server";
import type { Route } from "./+types/api-v1-instance";

export async function action({ request, params }: Route.ActionArgs) {
  try {
    if (request.method !== "DELETE") return methodNotAllowed("DELETE");
    const user = await requireApiUser(request);
    return apiJson(await deleteInstanceOp(user, params.id));
  } catch (error) {
    return apiError(error);
  }
}
