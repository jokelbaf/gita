import { Link } from "react-router";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";

export interface ErrorPageProps {
  status?: number;
  title: string;
  message: string;
}

export function ErrorPage({ status, title, message }: ErrorPageProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <Link to="/" aria-label="Gita home">
        <Logo />
      </Link>
      <div className="space-y-3">
        {status ? (
          <p className="text-7xl font-bold tracking-tighter text-muted-foreground/30 tabular-nums">
            {status}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mx-auto max-w-md text-balance text-muted-foreground">
          {message}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/widgets">Browse library</Link>
        </Button>
      </div>
    </div>
  );
}
