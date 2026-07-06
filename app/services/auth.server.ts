import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.server";
import { env, githubOAuthConfigured } from "./env.server";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once per day
  },
  user: {
    additionalFields: {
      username: { type: "string", required: false, input: false },
      githubId: { type: "string", required: false, input: false },
      avatarUrl: { type: "string", required: false, input: false },
    },
  },
  socialProviders: githubOAuthConfigured
    ? {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          mapProfileToUser: (profile) => ({
            name: profile.name ?? profile.login,
            username: profile.login,
            githubId: String(profile.id),
            avatarUrl: profile.avatar_url,
          }),
        },
      }
    : undefined,
});
