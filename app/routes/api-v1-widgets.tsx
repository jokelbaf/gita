import type { SortKey, TypeFilter } from "~/lib/widget";
import {
  apiError,
  apiJson,
  apiOrigin,
  methodNotAllowed,
  readJson,
  requireApiUser,
} from "~/services/api/http.server";
import {
  createWidgetOp,
  listWidgetsOp,
} from "~/services/api/operations.server";
import type { Route } from "./+types/api-v1-widgets";

const SORTS: SortKey[] = ["popular", "trending", "newest"];
const TYPES: TypeFilter[] = ["all", "GENERIC", "USER", "REPO"];

function truthy(value: string | null): boolean {
  return value === "1" || value === "true";
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const user = await requireApiUser(request);
    const params = new URL(request.url).searchParams;
    const type = params.get("type");
    const sort = params.get("sort");
    const limitRaw = params.get("limit");
    const result = await listWidgetsOp(
      user,
      {
        search: params.get("search") ?? undefined,
        type:
          type && TYPES.includes(type as TypeFilter)
            ? (type as TypeFilter)
            : undefined,
        sort:
          sort && SORTS.includes(sort as SortKey)
            ? (sort as SortKey)
            : undefined,
        forksOnly: truthy(params.get("forksOnly")),
        mine: truthy(params.get("mine")),
        cursor: params.get("cursor"),
        limit: limitRaw ? Number(limitRaw) : undefined,
      },
      apiOrigin(),
    );
    return apiJson(result);
  } catch (error) {
    return apiError(error);
  }
}

export async function action({ request }: Route.ActionArgs) {
  try {
    if (request.method !== "POST") return methodNotAllowed("GET, POST");
    const user = await requireApiUser(request);
    const body = await readJson(request);
    return apiJson(await createWidgetOp(user, body, apiOrigin()), 201);
  } catch (error) {
    return apiError(error);
  }
}
