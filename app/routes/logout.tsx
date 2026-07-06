import { redirect } from "react-router";
import { auth } from "~/services/auth.server";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
  const headers = new Headers();
  try {
    const response = await auth.api.signOut({
      headers: request.headers,
      asResponse: true,
    });
    for (const cookie of response.headers.getSetCookie()) {
      headers.append("Set-Cookie", cookie);
    }
  } catch {
    // No active session to clear - fall through to the redirect.
  }
  return redirect("/", { headers });
}

export async function loader() {
  return redirect("/");
}
