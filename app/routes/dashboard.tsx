import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { DashboardTabs } from "~/components/dashboard/dashboard-tabs";
import { NewWidgetButton } from "~/components/widgets/new-widget-button";
import { userContext } from "~/services/context";
import { getCredentialSummary } from "~/services/git/index.server";
import { listUserInstances } from "~/services/instances.server";
import { requireUser } from "~/services/session.server";
import {
  listForkedWidgets,
  listLikedWidgets,
  listUserWidgets,
} from "~/services/widgets.server";
import type { Route } from "./+types/dashboard";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Dashboard - gita" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const user = requireUser(context.get(userContext), request);
  const [widgets, instances, liked, forks, credential] = await Promise.all([
    listUserWidgets(user.id),
    listUserInstances(user.id),
    listLikedWidgets(user.id),
    listForkedWidgets(user.id),
    getCredentialSummary(user.id),
  ]);
  return { user, widgets, instances, liked, forks, credential };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user, widgets, instances, liked, forks, credential } = loaderData;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : null}
            <AvatarFallback>
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>
        <NewWidgetButton />
      </div>

      <div className="mt-8">
        <DashboardTabs
          widgets={widgets}
          instances={instances}
          liked={liked}
          forks={forks}
          credentialStatus={credential?.status ?? null}
        />
      </div>
    </div>
  );
}
