import { apiError, apiJson, requireApiUser } from "~/services/api/http.server";
import type { Route } from "./+types/api-v1-me";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const user = await requireApiUser(request);
    return apiJson({
      id: user.id,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    return apiError(error);
  }
}
