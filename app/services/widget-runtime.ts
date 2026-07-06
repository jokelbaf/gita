import type { WidgetType } from "~/lib/widget";
import type { GitRepo, GitUser } from "./git/types";

export type { GitLanguage, GitRelease, GitRepo, GitUser } from "./git/types";

export interface UserWidgetData {
  user: GitUser;
}

export interface RepoWidgetData {
  repo: GitRepo;
}

export type WidgetRuntimeData = UserWidgetData | RepoWidgetData;

export type WidgetDataForType<T extends WidgetType> = T extends "USER"
  ? UserWidgetData
  : T extends "REPO"
    ? RepoWidgetData
    : never;

export const GIT_USER_FIELDS = [
  ["profile.login", "string", "Git username, for example octocat."],
  ["profile.name", "string | null", "Display name when the provider has one."],
  ["profile.avatarUrl", "string | null", "Avatar image URL."],
  ["profile.bio", "string | null", "Profile bio."],
  ["profile.company", "string | null", "Company or organization text."],
  ["profile.location", "string | null", "Profile location."],
  ["profile.websiteUrl", "string | null", "Personal or blog URL."],
  ["profile.twitterUsername", "string | null", "Twitter/X handle, no @."],
  ["profile.type", '"User" | "Organization"', "Account kind."],
  [
    "profile.hireable",
    "boolean | null",
    "Whether the account is open to hire.",
  ],
  ["profile.followers", "number", "Follower count."],
  ["profile.following", "number", "Following count."],
  ["profile.publicRepos", "number", "Public repository count."],
  ["profile.publicGists", "number", "Public gist count."],
  ["profile.htmlUrl", "string | null", "Profile page URL."],
  ["profile.createdAt", "string | null", "ISO timestamp for account creation."],
] as const;

export const GIT_REPO_FIELDS = [
  ["meta.owner", "string", "Repository owner login."],
  ["meta.name", "string", "Repository name."],
  ["meta.fullName", "string", "owner/name."],
  ["meta.description", "string | null", "Repository description."],
  ["meta.homepageUrl", "string | null", "Configured homepage URL."],
  [
    "meta.visibility",
    '"public" | "private" | "internal"',
    "Repository visibility.",
  ],
  ["meta.topics", "string[]", "Repository topics."],
  ["meta.isFork", "boolean", "Whether the repository is a fork."],
  ["meta.archived", "boolean", "Whether the repository is archived."],
  ["meta.createdAt", "string | null", "ISO timestamp for creation."],
  ["meta.updatedAt", "string | null", "ISO timestamp for last update."],
  ["meta.pushedAt", "string | null", "ISO timestamp for last push."],
  ["stats.stars", "number", "Stargazer count."],
  ["stats.forks", "number", "Fork count."],
  ["stats.watchers", "number", "Watcher (subscriber) count."],
  ["stats.openIssues", "number", "Open issues, including pull requests."],
  ["primaryLanguage", "string | null", "Primary language, if known."],
  ["languages", "GitLanguage[]", "Language breakdown: bytes, percent, color."],
  ["code.defaultBranch", "string", "Default branch name."],
  ["code.sizeKb", "number", "Repository size in kilobytes."],
  ["latestRelease", "GitRelease | null", "Latest release metadata."],
  ["community.license", "string | null", "License SPDX id or name."],
  ["community.healthPercent", "number", "Community health score (0-100)."],
  ["community.hasReadme", "boolean", "Whether a README is present."],
  [
    "community.hasCodeOfConduct",
    "boolean",
    "Whether a code of conduct exists.",
  ],
  ["community.hasContributing", "boolean", "Whether contributing docs exist."],
  [
    "community.hasSecurityPolicy",
    "boolean",
    "Whether a security policy exists.",
  ],
] as const;

export const WIDGET_RUNTIME_TYPES = `type GitUser = {
  profile: GitUserProfile;
};

type GitUserProfile = {
  login: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  websiteUrl: string | null;
  twitterUsername: string | null;
  type: "User" | "Organization";
  hireable: boolean | null;
  followers: number;
  following: number;
  publicRepos: number;
  publicGists: number;
  htmlUrl: string | null;
  createdAt: string | null;
};

type GitLanguage = {
  name: string;
  percent: number;
  bytes: number;
  color: string | null;
};

type GitRelease = {
  tag: string;
  name: string | null;
  publishedAt: string | null;
  prerelease: boolean;
  htmlUrl: string | null;
};

type GitRepo = {
  meta: {
    owner: string;
    name: string;
    fullName: string;
    description: string | null;
    homepageUrl: string | null;
    visibility: "public" | "private" | "internal";
    topics: string[];
    isFork: boolean;
    archived: boolean;
    createdAt: string | null;
    updatedAt: string | null;
    pushedAt: string | null;
  };
  stats: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
  };
  primaryLanguage: string | null;
  languages: GitLanguage[];
  code: {
    defaultBranch: string;
    sizeKb: number;
  };
  latestRelease: GitRelease | null;
  community: {
    license: string | null;
    healthPercent: number;
    hasReadme: boolean;
    hasCodeOfConduct: boolean;
    hasContributing: boolean;
    hasSecurityPolicy: boolean;
  };
};`;
