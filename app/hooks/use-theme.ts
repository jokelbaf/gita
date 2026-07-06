import { useFetcher, useRouteLoaderData } from "react-router";
import { isTheme, type Theme } from "~/lib/theme";
import type { loader as rootLoader } from "~/root";

const SET_THEME_ACTION = "/resource/set-theme";

export function useTheme() {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  const fetcher = useFetcher();

  const pending = fetcher.formData?.get("theme");
  const theme: Theme = isTheme(pending) ? pending : (data?.theme ?? "light");

  function setTheme(next: Theme) {
    fetcher.submit(
      { theme: next },
      { method: "post", action: SET_THEME_ACTION },
    );
  }

  return {
    theme,
    setTheme,
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
