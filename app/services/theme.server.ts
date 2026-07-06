import { createCookie } from "react-router";
import { isTheme, type Theme } from "~/lib/theme";

const themeCookie = createCookie("gita_theme", {
  path: "/",
  sameSite: "lax",
  httpOnly: false,
  maxAge: 60 * 60 * 24 * 365,
});

export async function getTheme(request: Request): Promise<Theme> {
  const value = (await themeCookie.parse(request.headers.get("Cookie"))) as
    string | null;
  return isTheme(value) ? value : "light";
}

export function serializeTheme(theme: Theme): Promise<string> {
  return themeCookie.serialize(theme);
}
