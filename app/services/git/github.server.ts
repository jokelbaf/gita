import { cacheKeys, withCache } from "../cache.server";
import { GitError } from "./errors";
import { languageColor } from "./language-colors.server";
import type {
  GitAccountType,
  GitLanguage,
  GitProvider,
  GitRelease,
  GitRepo,
  GitRepoCommunity,
  GitRepoRef,
  GitRepoVisibility,
  GitUser,
  TokenValidation,
} from "./types";

const API_VERSION = "2022-11-28";
const USER_TTL = 300;
const REPO_TTL = 300;
const LANGUAGES_TTL = 900;
const RELEASE_TTL = 900;
const COMMUNITY_TTL = 900;
const REPO_LIST_TTL = 120;
const REPO_LIST_PAGES = 3; // up to 300 most-recently-pushed repos

type CommunityProfileData = Omit<GitRepoCommunity, "license">;

const EMPTY_COMMUNITY: CommunityProfileData = {
  healthPercent: 0,
  hasReadme: false,
  hasCodeOfConduct: false,
  hasContributing: false,
  hasSecurityPolicy: false,
};

interface GhUser {
  login: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  type: string;
  hireable: boolean | null;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  html_url: string | null;
  created_at: string | null;
}

interface GhRepo {
  name: string;
  owner: { login: string };
  full_name: string;
  description: string | null;
  homepage: string | null;
  visibility?: string;
  private: boolean;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  default_branch: string;
  size: number;
  stargazers_count: number;
  forks_count: number;
  subscribers_count?: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  license: { spdx_id: string | null; name: string } | null;
  created_at: string | null;
  updated_at: string | null;
  pushed_at: string | null;
}

interface GhRelease {
  tag_name: string;
  name: string | null;
  published_at: string | null;
  prerelease: boolean;
  html_url: string | null;
}

interface GhCommunityProfile {
  health_percentage: number;
  files: {
    readme: unknown | null;
    code_of_conduct: unknown | null;
    contributing: unknown | null;
    security: unknown | null;
  } | null;
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

function emptyToNull(value: string | null): string | null {
  return value && value.trim() ? value : null;
}

function normalizeVisibility(
  visibility: string | undefined,
  isPrivate: boolean,
): GitRepoVisibility {
  if (
    visibility === "public" ||
    visibility === "private" ||
    visibility === "internal"
  ) {
    return visibility;
  }
  return isPrivate ? "private" : "public";
}

function normalizeAccountType(type: string): GitAccountType {
  return type === "Organization" ? "Organization" : "User";
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
          profile: {
            login: u.login,
            name: u.name,
            avatarUrl: u.avatar_url,
            bio: u.bio,
            company: u.company,
            location: u.location,
            websiteUrl: emptyToNull(u.blog),
            twitterUsername: u.twitter_username,
            type: normalizeAccountType(u.type),
            hireable: u.hireable,
            followers: u.followers,
            following: u.following,
            publicRepos: u.public_repos,
            publicGists: u.public_gists,
            htmlUrl: u.html_url,
            createdAt: u.created_at,
          },
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
        const [r, languages, latestRelease, community] = await Promise.all([
          this.json<GhRepo>(path),
          this.getLanguages(owner, repo),
          this.getLatestRelease(owner, repo),
          this.getCommunityProfile(owner, repo),
        ]);
        return {
          meta: {
            owner: r.owner.login,
            name: r.name,
            fullName: r.full_name,
            description: r.description,
            homepageUrl: emptyToNull(r.homepage),
            visibility: normalizeVisibility(r.visibility, r.private),
            topics: r.topics ?? [],
            isFork: r.fork,
            archived: r.archived,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            pushedAt: r.pushed_at,
          },
          stats: {
            stars: r.stargazers_count,
            forks: r.forks_count,
            watchers: r.subscribers_count ?? r.watchers_count,
            openIssues: r.open_issues_count,
          },
          primaryLanguage: r.language,
          languages,
          code: {
            defaultBranch: r.default_branch,
            sizeKb: r.size,
          },
          latestRelease,
          community: {
            license: r.license?.spdx_id ?? r.license?.name ?? null,
            ...community,
          },
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

  private getLanguages(owner: string, repo: string): Promise<GitLanguage[]> {
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
            bytes,
            percent: Math.round((bytes / total) * 1000) / 10,
            color: languageColor(name),
          }))
          .sort((a, b) => b.bytes - a.bytes)
          .slice(0, 6);
      },
      { indexKey: this.indexKey },
    );
  }

  private getLatestRelease(
    owner: string,
    repo: string,
  ): Promise<GitRelease | null> {
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
            prerelease: rel.prerelease,
            htmlUrl: rel.html_url,
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

  private getCommunityProfile(
    owner: string,
    repo: string,
  ): Promise<CommunityProfileData> {
    return withCache(
      cacheKeys.git(
        "GITHUB",
        this.host,
        "community",
        `${owner}/${repo}`.toLowerCase(),
      ),
      COMMUNITY_TTL,
      async () => {
        try {
          const path = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/community/profile`;
          const c = await this.json<GhCommunityProfile>(path);
          return {
            healthPercent: c.health_percentage ?? 0,
            hasReadme: c.files?.readme != null,
            hasCodeOfConduct: c.files?.code_of_conduct != null,
            hasContributing: c.files?.contributing != null,
            hasSecurityPolicy: c.files?.security != null,
          };
        } catch (error) {
          if (error instanceof GitError && error.failure === "not_found")
            return EMPTY_COMMUNITY;
          throw error;
        }
      },
      { indexKey: this.indexKey },
    );
  }
}
