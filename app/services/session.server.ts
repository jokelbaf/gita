import { redirect } from "react-router";
import { auth } from "./auth.server";
import type { SessionUser } from "./context";

type RawUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  githubId?: string | null;
};

export async function getSessionUser(
  request: Request,
): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return null;

  const u = session.user as RawUser;
  return {
    id: u.id,
    name: u.name,
    username: u.username ?? u.name,
    email: u.email,
    avatarUrl: u.avatarUrl ?? u.image ?? null,
    githubId: u.githubId ?? null,
  };
}

export function loginRedirect(request: Request): string {
  const url = new URL(request.url);
  const redirectTo = url.pathname + url.search;
  return `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
}

export function requireUser(
  user: SessionUser | null,
  request: Request,
): SessionUser {
  if (!user) {
    throw redirect(loginRedirect(request));
  }
  return user;
}
