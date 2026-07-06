import { renderInstance } from "~/services/render/instance.server";
import type { Route } from "./+types/widget-user";

export async function loader({ params, request }: Route.LoaderArgs) {
  return renderInstance(request, params.instanceId, "USER");
}
