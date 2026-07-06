import { CalendarIcon, PackageOpenIcon } from "lucide-react";
import { GitHubIcon } from "~/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { WidgetGrid } from "~/components/widgets/widget-grid";
import { formatDate } from "~/lib/format";
import { userContext } from "~/services/context";
import { notFound } from "~/services/errors";
import { getProfile } from "~/services/widgets.server";
import type { Route } from "./+types/profile";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Profile - gita" }];
  return [
    {
      title: `${loaderData.profile.name} (@${loaderData.profile.username}) - gita`,
    },
  ];
}

export async function loader({ params, context }: Route.LoaderArgs) {
  const user = context.get(userContext);
  const profile = await getProfile(params.username, user?.id ?? null);
  if (!profile) throw notFound("That profile doesn’t exist.");
  return { profile };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { profile } = loaderData;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Avatar className="size-20">
          {profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
          ) : null}
          <AvatarFallback className="text-xl">
            {profile.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {profile.name}
            </h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="size-4" />
              Joined {formatDate(profile.joinedAt)}
            </span>
            <Button asChild variant="link" size="sm" className="h-auto px-0">
              <a href={profile.githubUrl} target="_blank" rel="noreferrer">
                <GitHubIcon />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
          {profile.widgets.length} public{" "}
          {profile.widgets.length === 1 ? "widget" : "widgets"}
        </h2>
        {profile.widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageOpenIcon className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              @{profile.username} hasn’t published any public widgets yet.
            </p>
          </div>
        ) : (
          <WidgetGrid widgets={profile.widgets} />
        )}
      </section>
    </div>
  );
}
