import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { LoginPromptProvider } from "~/components/auth/login-prompt";
import { ErrorPage } from "~/components/error-page";
import { PageTransition } from "~/components/layout/page-transition";
import { SiteFooter } from "~/components/layout/site-footer";
import { SiteHeader } from "~/components/layout/site-header";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { userContext } from "~/services/context";
import type { ErrorPayload } from "~/services/errors";
import { requestLogger, sessionMiddleware } from "~/services/middleware.server";
import { getTheme } from "~/services/theme.server";

export const middleware: Route.MiddlewareFunction[] = [
  requestLogger,
  sessionMiddleware,
];

const TAGLINE = "gita - widgets for GitHub READMEs";
const DESCRIPTION =
  "Create, configure, and embed dynamic, community-built widgets in any GitHub README.";

export const meta: Route.MetaFunction = () => [
  { title: TAGLINE },
  { name: "description", content: DESCRIPTION },
  { property: "og:title", content: TAGLINE },
  { property: "og:description", content: DESCRIPTION },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: "gita" },
  { name: "twitter:card", content: "summary" },
  { name: "twitter:title", content: TAGLINE },
  { name: "twitter:description", content: DESCRIPTION },
];

export async function loader({ request, context }: Route.LoaderArgs) {
  return {
    user: context.get(userContext),
    theme: await getTheme(request),
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const theme = data?.theme ?? "light";

  return (
    <html lang="en" className={theme} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0a0a0a"
          media="(prefers-color-scheme: dark)"
        />
        <Meta />
        <Links />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <LoginPromptProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <SiteFooter />
      </div>
    </LoginPromptProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status: number | undefined;
  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (error.status === 404) {
      title = "Page not found";
      message = "The page you’re looking for doesn’t exist or has moved.";
    } else {
      const payload = error.data as ErrorPayload | string | undefined;
      title = `Error ${error.status}`;
      message =
        (typeof payload === "object" && payload?.message) ||
        (typeof payload === "string" ? payload : error.statusText) ||
        message;
    }
  }

  return <ErrorPage status={status} title={title} message={message} />;
}
