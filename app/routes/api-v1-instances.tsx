import {
  apiError,
  apiJson,
  apiOrigin,
  methodNotAllowed,
  readJson,
  requireApiUser,
} from "~/services/api/http.server";
import {
  createInstanceOp,
  listInstancesOp,
} from "~/services/api/operations.server";
import type { Route } from "./+types/api-v1-instances";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const user = await requireApiUser(request);
    return apiJson(await listInstancesOp(user, apiOrigin()));
  } catch (error) {
    return apiError(error);
  }
}

export async function action({ request }: Route.ActionArgs) {
  try {
    if (request.method !== "POST") return methodNotAllowed("GET, POST");
    const user = await requireApiUser(request);
    const body = await readJson(request);
    return apiJson(await createInstanceOp(user, body, apiOrigin()), 201);
  } catch (error) {
    return apiError(error);
  }
}
