import { useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root";
import type { SessionUser } from "~/services/context";

export function useOptionalUser(): SessionUser | null {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  return data?.user ?? null;
}
