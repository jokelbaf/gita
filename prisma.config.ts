import { defineConfig, env } from "prisma/config";

try {
  process.loadEnvFile();
} catch {
  // no .env file - rely on the ambient environment
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
