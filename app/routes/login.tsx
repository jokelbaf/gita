import { useState } from "react";
import { redirect } from "react-router";
import { GitHubIcon } from "~/components/icons";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { safeRedirect } from "~/lib/redirect";
import { authClient } from "~/services/auth-client";
import { userContext } from "~/services/context";
import { githubOAuthConfigured } from "~/services/env.server";
import type { Route } from "./+types/login";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Sign in - gita" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = context.get(userContext);
  const url = new URL(request.url);
  const redirectTo = safeRedirect(url.searchParams.get("redirectTo"));
  if (user) {
    throw redirect(redirectTo);
  }
  return { redirectTo, githubConfigured: githubOAuthConfigured };
}

export default function Login({ loaderData }: Route.ComponentProps) {
  const { redirectTo, githubConfigured } = loaderData;
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: redirectTo,
      });
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader className="items-center text-center">
          <Logo className="mb-2" />
          <CardTitle className="text-xl">Welcome to gita</CardTitle>
          <CardDescription>
            Sign in to create, configure, and manage widgets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={signIn}
            disabled={loading || !githubConfigured}
          >
            <GitHubIcon />
            {loading ? "Redirecting…" : "Continue with GitHub"}
          </Button>
          {!githubConfigured ? (
            <p className="text-center text-xs text-muted-foreground">
              GitHub OAuth isn’t configured. Add{" "}
              <code className="text-foreground">GITHUB_CLIENT_ID</code> and{" "}
              <code className="text-foreground">GITHUB_CLIENT_SECRET</code> to
              your <code className="text-foreground">.env</code>.
            </p>
          ) : null}
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-xs text-muted-foreground">
            We request read-only access to your public profile - no write
            scopes.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
