import { data } from "react-router";
import { isTheme } from "~/lib/theme";
import { serializeTheme } from "~/services/theme.server";
import type { Route } from "./+types/set-theme";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const value = form.get("theme");
  const theme = isTheme(value) ? value : "light";
  return data(
    { theme },
    { headers: { "Set-Cookie": await serializeTheme(theme) } },
  );
}
