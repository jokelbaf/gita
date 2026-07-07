export type GitProviderId = "GITHUB" | "GITLAB" | "GITEA" | "FORGEJO";

export type GitRepoVisibility = "public" | "private" | "internal";

export type GitAccountType = "User" | "Organization";

export interface GitUserProfile {
  login: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  websiteUrl: string | null;
  twitterUsername: string | null;
  type: GitAccountType;
  hireable: boolean | null;
  followers: number;
  following: number;
  publicRepos: number;
  publicGists: number;
  htmlUrl: string | null;
  createdAt: string | null;
}

export interface GitUser {
  profile: GitUserProfile;
}

export interface GitLanguage {
  name: string;
  percent: number;
  bytes: number;
  color: string | null;
}

export interface GitRelease {
  tag: string;
  name: string | null;
  publishedAt: string | null;
  prerelease: boolean;
  htmlUrl: string | null;
}

export interface GitRepoMeta {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  homepageUrl: string | null;
  visibility: GitRepoVisibility;
  topics: string[];
  isFork: boolean;
  archived: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  pushedAt: string | null;
}

export interface GitRepoStats {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
}

export interface GitRepoCode {
  defaultBranch: string;
  sizeKb: number;
}

export interface GitRepoCommunity {
  license: string | null;
  healthPercent: number;
  hasReadme: boolean;
  hasCodeOfConduct: boolean;
  hasContributing: boolean;
  hasSecurityPolicy: boolean;
}

export interface GitRepo {
  meta: GitRepoMeta;
  stats: GitRepoStats;
  primaryLanguage: string | null;
  languages: GitLanguage[];
  code: GitRepoCode;
  latestRelease: GitRelease | null;
  community: GitRepoCommunity;
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
