export type GitFailure =
  | "auth" // 401/403 bad or revoked credentials
  | "not_found" // 404
  | "rate_limited" // provider rate limit exhausted
  | "network" // transport failure
  | "unknown";

export class GitError extends Error {
  readonly failure: GitFailure;
  readonly status?: number;
  constructor(failure: GitFailure, message: string, status?: number) {
    super(message);
    this.name = "GitError";
    this.failure = failure;
    this.status = status;
  }
}
