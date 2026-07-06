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
  ["login", "string", "Git username, for example octocat."],
  ["name", "string | null", "Display name when the provider has one."],
  ["avatarUrl", "string | null", "Avatar image URL."],
  ["bio", "string | null", "Profile bio."],
  ["company", "string | null", "Company or organization text."],
  ["location", "string | null", "Profile location."],
  ["followers", "number", "Follower count."],
  ["following", "number", "Following count."],
  ["publicRepos", "number", "Public repository count."],
  ["createdAt", "string | null", "ISO timestamp for account creation."],
] as const;

export const GIT_REPO_FIELDS = [
  ["owner", "string", "Repository owner login."],
  ["name", "string", "Repository name."],
  ["fullName", "string", "owner/name."],
  ["description", "string | null", "Repository description."],
  ["stars", "number", "Stargazer count."],
  ["forks", "number", "Fork count."],
  ["watchers", "number", "Watcher count."],
  ["openIssues", "number", "Open issue count."],
  ["primaryLanguage", "string | null", "Primary language, if known."],
  ["languages", "GitLanguage[]", "Language breakdown as percentages."],
  ["latestRelease", "GitRelease | null", "Latest release metadata."],
  ["license", "string | null", "License SPDX/name when available."],
  ["pushedAt", "string | null", "ISO timestamp for last push."],
] as const;

export const WIDGET_RUNTIME_TYPES = `type GitUser = {
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
};

type GitLanguage = {
  name: string;
  percent: number;
};

type GitRelease = {
  tag: string;
  name: string | null;
  publishedAt: string | null;
};

type GitRepo = {
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
};`;
