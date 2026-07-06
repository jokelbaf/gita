import { notFound } from "~/services/errors";
import { httpLog } from "~/services/logger.server";
import type { Route } from "./+types/catch-all";

export function loader({ request }: Route.LoaderArgs) {
  const { pathname } = new URL(request.url);
  httpLog.warn({ path: pathname }, `404 Not Found: ${pathname}`);
  throw notFound(`No route matches ${pathname}`);
}

export default function CatchAll() {
  return null;
}
