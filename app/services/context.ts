import { createContext } from "react-router";

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  githubId: string | null;
}

export const userContext = createContext<SessionUser | null>(null);
