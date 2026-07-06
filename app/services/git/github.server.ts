import { cacheKeys, withCache } from "../cache.server";
import { GitError } from "./errors";
import type {
  GitProvider,
  GitRepo,
  GitRepoRef,
  GitUser,
  TokenValidation,
} from "./types";

const API_VERSION = "2022-11-28";
const USER_TTL = 300;
const REPO_TTL = 300;
const LANGUAGES_TTL = 900;
const RELEASE_TTL = 900;
const REPO_LIST_TTL = 120;
const REPO_LIST_PAGES = 3; // up to 300 most-recently-pushed repos

interface GhUser {
  login: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string | null;
}

interface GhRepo {
  name: string;
  owner: { login: string };
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  subscribers_count?: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  license: { spdx_id: string | null; name: string } | null;
  pushed_at: string | null;
}

interface GhRelease {
  tag_name: string;
  name: string | null;
  published_at: string | null;
}

interface GhRepoRef {
  name: string;
  owner: { login: string };
  full_name: string;
  description: string | null;
  private: boolean;
}

export interface GitHubProviderConfig {
  token: string;
  baseUrl: string;
  userId: string;
}

export class GitHubProvider implements GitProvider {
  readonly id = "GITHUB" as const;
  private readonly token: string;
  private readonly apiBase: string;
  private readonly host: string;
  private readonly indexKey: string;

  constructor(config: GitHubProviderConfig) {
    this.token = config.token;
    const url = new URL(config.baseUrl);
    this.host = url.host;

    this.apiBase =
      this.host === "github.com"
        ? "https://api.github.com"
        : `${url.origin}/api/v3`;
    this.indexKey = cacheKeys.userGitIndex(config.userId);
  }

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": API_VERSION,
      "User-Agent": "gita-widgets",
    };
  }

  private async request(path: string): Promise<Response> {
    try {
      return await fetch(`${this.apiBase}${path}`, { headers: this.headers() });
    } catch (error) {
      throw new GitError(
        "network",
        error instanceof Error ? error.message : "Network error",
      );
    }
  }

  private raise(res: Response): never {
    if (res.status === 401) {
      throw new GitError(
        "auth",
        "The git token is invalid or was revoked.",
        401,
      );
    }
    if (res.status === 403) {
      const remaining = res.headers.get("x-ratelimit-remaining");
      if (remaining === "0") {
        throw new GitError("rate_limited", "GitHub rate limit exceeded.", 403);
      }
      throw new GitError(
        "auth",
        "The git token lacks access to this resource.",
        403,
      );
    }
    if (res.status === 404) {
      throw new GitError("not_found", "Not found on GitHub.", 404);
    }
    throw new GitError(
      "unknown",
      `GitHub responded ${res.status}.`,
      res.status,
    );
  }

  private async json<T>(path: string): Promise<T> {
    const res = await this.request(path);
    if (!res.ok) this.raise(res);
    return (await res.json()) as T;
  }

  async validateToken(): Promise<TokenValidation> {
    const res = await this.request("/user");
    if (res.status === 401) {
      return { valid: false, error: "The token is invalid or was revoked." };
    }
    if (!res.ok) {
      return { valid: false, error: `GitHub responded ${res.status}.` };
    }
    const user = (await res.json()) as GhUser;

    const scopeHeader = res.headers.get("x-oauth-scopes") ?? "";
    const scopes = scopeHeader
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const warnings: string[] = [];
    if (scopes.length > 0 && !scopes.includes("repo")) {
      warnings.push(
        "Token lacks the `repo` scope - private repositories won't be visible.",
      );
    }
    return {
      valid: true,
      login: user.login,
      scopes,
      expiresAt: res.headers.get("github-authentication-token-expiration"),
      warnings,
    };
  }

  async getUser(login: string): Promise<GitUser> {
    return withCache(
      cacheKeys.git("GITHUB", this.host, "user", login.toLowerCase()),
      USER_TTL,
      async () => {
        const u = await this.json<GhUser>(
          `/users/${encodeURIComponent(login)}`,
        );
        return {
          login: u.login,
          name: u.name,
          avatarUrl: u.avatar_url,
          bio: u.bio,
          company: u.company,
          location: u.location,
          followers: u.followers,
          following: u.following,
          publicRepos: u.public_repos,
          createdAt: u.created_at,
        } satisfies GitUser;
      },
      { indexKey: this.indexKey },
    );
  }

  async getRepo(owner: string, repo: string): Promise<GitRepo> {
    const slug = `${owner}/${repo}`.toLowerCase();
    return withCache(
      cacheKeys.git("GITHUB", this.host, "repo", slug),
      REPO_TTL,
      async () => {
        const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
        const r = await this.json<GhRepo>(path);
        const [languages, latestRelease] = await Promise.all([
          this.getLanguages(owner, repo),
          this.getLatestRelease(owner, repo),
        ]);
        return {
          owner: r.owner.login,
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          stars: r.stargazers_count,
          forks: r.forks_count,
          watchers: r.subscribers_count ?? r.watchers_count,
          openIssues: r.open_issues_count,
          primaryLanguage: r.language,
          languages,
          latestRelease,
          license: r.license?.spdx_id ?? r.license?.name ?? null,
          pushedAt: r.pushed_at,
        } satisfies GitRepo;
      },
      { indexKey: this.indexKey },
    );
  }

  async listRepos(): Promise<GitRepoRef[]> {
    return withCache(
      cacheKeys.git("GITHUB", this.host, "repos", "self"),
      REPO_LIST_TTL,
      async () => {
        const out: GitRepoRef[] = [];

        for (let page = 1; page <= REPO_LIST_PAGES; page++) {
          const batch = await this.json<GhRepoRef[]>(
            `/user/repos?per_page=100&sort=pushed&affiliation=owner,organization_member,collaborator&page=${page}`,
          );
          for (const r of batch) {
            out.push({
              owner: r.owner.login,
              name: r.name,
              fullName: r.full_name,
              description: r.description,
              private: r.private,
            });
          }
          if (batch.length < 100) break;
        }
        return out;
      },
      { indexKey: this.indexKey },
    );
  }

  private getLanguages(owner: string, repo: string) {
    return withCache(
      cacheKeys.git(
        "GITHUB",
        this.host,
        "languages",
        `${owner}/${repo}`.toLowerCase(),
      ),
      LANGUAGES_TTL,
      async () => {
        const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`;
        const raw = await this.json<Record<string, number>>(path);
        const total = Object.values(raw).reduce((a, b) => a + b, 0) || 1;
        return Object.entries(raw)
          .map(([name, bytes]) => ({
            name,
            percent: Math.round((bytes / total) * 1000) / 10,
          }))
          .sort((a, b) => b.percent - a.percent)
          .slice(0, 6);
      },
      { indexKey: this.indexKey },
    );
  }

  private getLatestRelease(owner: string, repo: string) {
    return withCache(
      cacheKeys.git(
        "GITHUB",
        this.host,
        "release",
        `${owner}/${repo}`.toLowerCase(),
      ),
      RELEASE_TTL,
      async () => {
        try {
          const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/latest`;
          const rel = await this.json<GhRelease>(path);
          return {
            tag: rel.tag_name,
            name: rel.name,
            publishedAt: rel.published_at,
          };
        } catch (error) {
          if (error instanceof GitError && error.failure === "not_found")
            return null;
          throw error;
        }
      },
      { indexKey: this.indexKey },
    );
  }
}
