import type { GitProvider as GitProviderModel } from "~/generated/prisma/enums";
import type { WidgetInstance } from "~/generated/prisma/client";
import { cacheKeys, invalidateByIndex } from "../cache.server";
import { decryptSecret, encryptSecret, last4 } from "../crypto.server";
import { prisma } from "../db.server";
import { githubLog } from "../logger.server";
import { GitError } from "./errors";
import { GitHubProvider } from "./github.server";
import type {
  GitProvider,
  GitProviderId,
  GitRepoRef,
  TokenValidation,
} from "./types";

export type {
  GitProviderId,
  GitUser,
  GitRepo,
  GitRepoRef,
  TokenValidation,
} from "./types";
export { GitError } from "./errors";

// Orchestration layer over the provider adapters (SPEC §9). Everything that needs
// git data goes through here: it resolves the *instance owner's* credential,
// decrypts the token, builds the right adapter, and - crucially - turns a revoked
// token into a credential-invalidation so renders degrade gracefully.

const SUPPORTED: GitProviderId[] = ["GITHUB"];

export function isProviderSupported(id: GitProviderId): boolean {
  return SUPPORTED.includes(id);
}

function buildProvider(
  provider: GitProviderModel,
  baseUrl: string,
  token: string,
  userId: string,
): GitProvider {
  switch (provider) {
    case "GITHUB":
      return new GitHubProvider({ token, baseUrl, userId });
    default:
      throw new GitError("unknown", `${provider} is not supported yet.`);
  }
}

export interface SaveCredentialInput {
  provider: GitProviderId;
  baseUrl: string;
  token: string;
}

export type SaveCredentialResult =
  { ok: true; validation: TokenValidation } | { ok: false; error: string };

/**
 * Validate a token against its provider, then (only if valid) encrypt and store
 * it. Returns structured errors so the settings form can show them inline.
 */
export async function saveCredential(
  userId: string,
  input: SaveCredentialInput,
): Promise<SaveCredentialResult> {
  if (!isProviderSupported(input.provider)) {
    return { ok: false, error: `${input.provider} is not supported yet.` };
  }
  const token = input.token.trim();
  if (!token) return { ok: false, error: "A token is required." };

  let validation: TokenValidation;
  try {
    const provider = buildProvider(
      input.provider,
      input.baseUrl,
      token,
      userId,
    );
    validation = await provider.validateToken();
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not validate the token.",
    };
  }
  if (!validation.valid) {
    return { ok: false, error: validation.error ?? "The token is not valid." };
  }

  await prisma.gitCredential.upsert({
    where: { userId },
    create: {
      userId,
      provider: input.provider,
      baseUrl: input.baseUrl,
      encryptedToken: encryptSecret(token),
      last4: last4(token),
      scopes: validation.scopes ?? [],
      accountLogin: validation.login ?? "",
      expiresAt: validation.expiresAt ? new Date(validation.expiresAt) : null,
      validatedAt: new Date(),
      invalidatedAt: null,
    },
    update: {
      provider: input.provider,
      baseUrl: input.baseUrl,
      encryptedToken: encryptSecret(token),
      last4: last4(token),
      scopes: validation.scopes ?? [],
      accountLogin: validation.login ?? "",
      expiresAt: validation.expiresAt ? new Date(validation.expiresAt) : null,
      validatedAt: new Date(),
      invalidatedAt: null,
    },
  });
  // A new token means previously cached responses may now be stale/scoped
  // differently - purge this user's git cache.
  await invalidateByIndex(cacheKeys.userGitIndex(userId));
  return { ok: true, validation };
}

export async function removeCredential(userId: string): Promise<void> {
  await prisma.gitCredential.deleteMany({ where: { userId } });
  await invalidateByIndex(cacheKeys.userGitIndex(userId));
}

export async function markCredentialInvalid(userId: string): Promise<void> {
  const updated = await prisma.gitCredential.updateMany({
    where: { userId, invalidatedAt: null },
    data: { invalidatedAt: new Date() },
  });
  if (updated.count > 0) {
    githubLog.warn(
      { userId },
      "git credential marked invalid (revoked or expired)",
    );
  }
}

export interface CredentialSummary {
  provider: GitProviderId;
  baseUrl: string;
  accountLogin: string;
  last4: string;
  scopes: string[];
  expiresAt: string | null;
  validatedAt: string;
  status: "active" | "invalid" | "expired";
}

/** Non-sensitive view of a user's credential (never includes the token). */
export async function getCredentialSummary(
  userId: string,
): Promise<CredentialSummary | null> {
  const c = await prisma.gitCredential.findUnique({ where: { userId } });
  if (!c) return null;
  const expired = c.expiresAt !== null && c.expiresAt.getTime() < Date.now();
  return {
    provider: c.provider,
    baseUrl: c.baseUrl,
    accountLogin: c.accountLogin,
    last4: c.last4,
    scopes: c.scopes,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    validatedAt: c.validatedAt.toISOString(),
    status: c.invalidatedAt ? "invalid" : expired ? "expired" : "active",
  };
}

export type ListReposResult =
  | { status: "ok"; repos: GitRepoRef[] }
  | { status: "no_credential" }
  | { status: "invalid_credential" }
  | { status: "error"; message: string };

export async function listUserRepos(userId: string): Promise<ListReposResult> {
  const credential = await prisma.gitCredential.findUnique({
    where: { userId },
  });
  if (!credential) return { status: "no_credential" };
  if (credential.invalidatedAt) return { status: "invalid_credential" };
  if (!isProviderSupported(credential.provider)) {
    return { status: "no_credential" };
  }

  let token: string;
  try {
    token = decryptSecret(credential.encryptedToken);
  } catch {
    return { status: "invalid_credential" };
  }

  const provider = buildProvider(
    credential.provider,
    credential.baseUrl,
    token,
    userId,
  );
  try {
    return { status: "ok", repos: await provider.listRepos() };
  } catch (error) {
    if (error instanceof GitError && error.failure === "auth") {
      await markCredentialInvalid(userId);
      return { status: "invalid_credential" };
    }
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Could not list repositories.",
    };
  }
}

// ---------------------------------------------------------------------------
// Instance data resolution (used by the render endpoints)
// ---------------------------------------------------------------------------

export type InstanceDataResult =
  | { status: "ok"; data: Record<string, unknown> }
  | { status: "no_credential" }
  | { status: "invalid_credential" }
  | { status: "target_missing" };

type InstanceTarget = Pick<
  WidgetInstance,
  "ownerId" | "targetType" | "targetLogin" | "targetRepo"
>;

/**
 * Resolve the git data for a user/repo instance using its owner's credential.
 * Returns a status the render endpoint maps to real data, the reconnect image, or
 * the tombstone. A revoked/expired token (auth failure) invalidates the credential
 * as a side effect. May throw {@link GitError} for transient failures (rate limit,
 * network) - the endpoint turns those into a generic error image.
 */
export async function loadInstanceData(
  instance: InstanceTarget,
): Promise<InstanceDataResult> {
  const credential = await prisma.gitCredential.findUnique({
    where: { userId: instance.ownerId },
  });
  if (!credential) return { status: "no_credential" };
  if (credential.invalidatedAt) return { status: "invalid_credential" };
  if (!isProviderSupported(credential.provider)) {
    return { status: "no_credential" };
  }

  let token: string;
  try {
    token = decryptSecret(credential.encryptedToken);
  } catch {
    return { status: "invalid_credential" };
  }

  const provider = buildProvider(
    credential.provider,
    credential.baseUrl,
    token,
    instance.ownerId,
  );

  try {
    if (instance.targetType === "USER") {
      const user = await provider.getUser(instance.targetLogin);
      return { status: "ok", data: { user } };
    }
    if (!instance.targetRepo) return { status: "target_missing" };
    const repo = await provider.getRepo(
      instance.targetLogin,
      instance.targetRepo,
    );
    return { status: "ok", data: { repo } };
  } catch (error) {
    if (error instanceof GitError && error.failure === "auth") {
      await markCredentialInvalid(instance.ownerId);
      return { status: "invalid_credential" };
    }
    if (error instanceof GitError && error.failure === "not_found") {
      return { status: "target_missing" };
    }
    throw error;
  }
}
