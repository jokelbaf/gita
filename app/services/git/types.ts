export type GitProviderId = "GITHUB" | "GITLAB" | "GITEA" | "FORGEJO";

export interface GitUser {
  login: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string | null;
}

export interface GitLanguage {
  name: string;
  percent: number;
}

export interface GitRelease {
  tag: string;
  name: string | null;
  publishedAt: string | null;
}

export interface GitRepo {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  primaryLanguage: string | null;
  languages: GitLanguage[];
  latestRelease: GitRelease | null;
  license: string | null;
  pushedAt: string | null;
}

export interface GitRepoRef {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
}

export interface TokenValidation {
  valid: boolean;
  login?: string;
  scopes?: string[];
  expiresAt?: string | null;
  /** Non-fatal notes, e.g. "token can't read private repositories". */
  warnings?: string[];
  /** Populated when `valid` is false. */
  error?: string;
}

export interface GitProvider {
  readonly id: GitProviderId;
  validateToken(): Promise<TokenValidation>;
  getUser(login: string): Promise<GitUser>;
  getRepo(owner: string, repo: string): Promise<GitRepo>;
  listRepos(): Promise<GitRepoRef[]>;
}
