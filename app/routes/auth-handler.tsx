import { auth } from "~/services/auth.server";
import type { Route } from "./+types/auth-handler";

export function loader({ request }: Route.LoaderArgs) {
  return auth.handler(request);
}

export function action({ request }: Route.ActionArgs) {
  return auth.handler(request);
}
