import { pino } from "pino";
import { env, isProduction } from "./env.server";

const level = env.LOG_LEVEL ?? (isProduction ? "info" : "debug");

export const logger = pino({
  level,
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: true,
          translateTime: "SYS:HH:MM:ss",
          ignore: "pid,hostname,subsystem",
          messageFormat: "[{subsystem}] {msg}",
        },
      },
});

export const httpLog = logger.child({ subsystem: "http" });
export const renderLog = logger.child({ subsystem: "render" });
export const githubLog = logger.child({ subsystem: "github" });
export const cacheLog = logger.child({ subsystem: "cache" });
export const dbLog = logger.child({ subsystem: "db" });
