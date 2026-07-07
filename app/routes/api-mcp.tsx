import { apiOrigin } from "~/services/api/http.server";
import { handleMcp } from "~/services/api/mcp.server";
import type { Route } from "./+types/api-mcp";

export function loader({ request }: Route.LoaderArgs) {
  return handleMcp(request, apiOrigin());
}

export function action({ request }: Route.ActionArgs) {
  return handleMcp(request, apiOrigin());
}
