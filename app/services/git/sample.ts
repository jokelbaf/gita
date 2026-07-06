import type { GitRepo, GitUser } from "./types";
import type { TargetType } from "~/generated/prisma/enums";

const SAMPLE_USER: GitUser = {
  profile: {
    login: "octocat",
    name: "The Octocat",
    avatarUrl: "https://github.com/octocat.png",
    bio: "Building things on GitHub.",
    company: "@github",
    location: "San Francisco, CA",
    websiteUrl: "https://github.blog",
    twitterUsername: "github",
    type: "User",
    hireable: null,
    followers: 9184,
    following: 9,
    publicRepos: 8,
    publicGists: 8,
    htmlUrl: "https://github.com/octocat",
    createdAt: "2011-01-25T18:44:36Z",
  },
};

const SAMPLE_REPO: GitRepo = {
  meta: {
    owner: "facebook",
    name: "react",
    fullName: "facebook/react",
    description: "The library for web and native user interfaces.",
    homepageUrl: "https://react.dev",
    visibility: "public",
    topics: ["javascript", "react", "frontend", "ui", "library"],
    isFork: false,
    archived: false,
    createdAt: "2013-05-24T16:15:54Z",
    updatedAt: "2025-06-30T12:00:00Z",
    pushedAt: "2025-06-30T12:00:00Z",
  },
  stats: {
    stars: 228000,
    forks: 46700,
    watchers: 6700,
    openIssues: 750,
  },
  primaryLanguage: "JavaScript",
  languages: [
    { name: "JavaScript", percent: 92.1, bytes: 12_800_000, color: "#f1e05a" },
    { name: "TypeScript", percent: 4.3, bytes: 600_000, color: "#3178c6" },
    { name: "HTML", percent: 1.9, bytes: 264_000, color: "#e34c26" },
    { name: "CSS", percent: 1.7, bytes: 236_000, color: "#563d7c" },
  ],
  code: {
    defaultBranch: "main",
    sizeKb: 356_000,
  },
  latestRelease: {
    tag: "v19.0.0",
    name: "19.0.0",
    publishedAt: "2024-12-05T00:00:00Z",
    prerelease: false,
    htmlUrl: "https://github.com/facebook/react/releases/tag/v19.0.0",
  },
  community: {
    license: "MIT",
    healthPercent: 100,
    hasReadme: true,
    hasCodeOfConduct: true,
    hasContributing: true,
    hasSecurityPolicy: true,
  },
};

/** Sample `data` prop for previewing a user/repo widget without an instance. */
export function sampleData(type: TargetType): Record<string, unknown> {
  return type === "USER" ? { user: SAMPLE_USER } : { repo: SAMPLE_REPO };
}
