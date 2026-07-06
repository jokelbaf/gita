import type { GitRepo, GitUser } from "./types";
import type { TargetType } from "~/generated/prisma/enums";

const SAMPLE_USER: GitUser = {
  login: "octocat",
  name: "The Octocat",
  avatarUrl: "https://github.com/octocat.png",
  bio: "Building things on GitHub.",
  company: "@github",
  location: "San Francisco, CA",
  followers: 9184,
  following: 9,
  publicRepos: 8,
  createdAt: "2011-01-25T18:44:36Z",
};

const SAMPLE_REPO: GitRepo = {
  owner: "facebook",
  name: "react",
  fullName: "facebook/react",
  description: "The library for web and native user interfaces.",
  stars: 228000,
  forks: 46700,
  watchers: 228000,
  openIssues: 750,
  primaryLanguage: "JavaScript",
  languages: [
    { name: "JavaScript", percent: 92.1 },
    { name: "TypeScript", percent: 4.3 },
    { name: "HTML", percent: 1.9 },
    { name: "CSS", percent: 1.7 },
  ],
  latestRelease: {
    tag: "v19.0.0",
    name: "19.0.0",
    publishedAt: "2024-12-05T00:00:00Z",
  },
  license: "MIT",
  pushedAt: "2025-06-30T12:00:00Z",
};

/** Sample `data` prop for previewing a user/repo widget without an instance. */
export function sampleData(type: TargetType): Record<string, unknown> {
  return type === "USER" ? { user: SAMPLE_USER } : { repo: SAMPLE_REPO };
}
