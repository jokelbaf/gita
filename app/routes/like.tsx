import { userContext } from "~/services/context";
import { AppError } from "~/services/errors";
import { toggleLike } from "~/services/likes.server";
import type { Route } from "./+types/like";

export async function action({ request, context }: Route.ActionArgs) {
  const user = context.get(userContext);
  if (!user) {
    return Response.json(
      { error: "Sign in to like widgets." },
      { status: 401 },
    );
  }

  const form = await request.formData();
  const widgetId = String(form.get("widgetId") ?? "");
  if (!widgetId) {
    return Response.json({ error: "Missing widget id." }, { status: 400 });
  }

  try {
    return Response.json(await toggleLike(user.id, widgetId));
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    const message =
      error instanceof AppError ? error.message : "Could not toggle like.";
    return Response.json({ error: message }, { status });
  }
}

export function loader() {
  return Response.json({ error: "Method not allowed." }, { status: 405 });
}
