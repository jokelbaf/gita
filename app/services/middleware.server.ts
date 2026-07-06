import type { MiddlewareFunction } from "react-router";
import { userContext } from "./context";
import { httpLog } from "./logger.server";
import { getSessionUser } from "./session.server";

export const requestLogger: MiddlewareFunction<Response> = async (
  { request },
  next,
) => {
  const start = performance.now();
  const { pathname, search } = new URL(request.url);
  const response = await next();
  const durationMs = Math.round((performance.now() - start) * 10) / 10;
  httpLog.info(
    {
      method: request.method,
      path: pathname + search,
      status: response.status,
      durationMs,
    },
    `${request.method} ${pathname} > ${response.status} (${durationMs}ms)`,
  );
  return response;
};

export const sessionMiddleware: MiddlewareFunction<Response> = async (
  { request, context },
  next,
) => {
  context.set(userContext, await getSessionUser(request));
  return next();
};
