import { KeyRoundIcon, PackageOpenIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { WidgetGrid } from "~/components/widgets/widget-grid";
import type { CredentialSummary } from "~/services/git/index.server";
import type { InstanceListItem } from "~/services/instances.server";
import type { WidgetCard } from "~/lib/widget";
import { InstanceRow } from "./instance-row";
import { MyWidgetCard } from "./my-widget-card";

interface DashboardTabsProps {
  widgets: WidgetCard[];
  instances: InstanceListItem[];
  liked: WidgetCard[];
  forks: WidgetCard[];
  credentialStatus: CredentialSummary["status"] | null;
}

export function DashboardTabs({
  widgets,
  instances,
  liked,
  forks,
  credentialStatus,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="widgets">
      <TabsList className="w-full max-w-xl">
        <TabsTrigger value="widgets">Widgets ({widgets.length})</TabsTrigger>
        <TabsTrigger value="instances">
          Instances ({instances.length})
        </TabsTrigger>
        <TabsTrigger value="liked">Liked ({liked.length})</TabsTrigger>
        <TabsTrigger value="forks">Forks ({forks.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="widgets" className="mt-6">
        {widgets.length === 0 ? (
          <Empty
            title="No widgets yet"
            body="Create your first widget to see it here."
            action={
              <Button asChild size="sm">
                <Link to="/widgets/new">New widget</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget) => (
              <MyWidgetCard key={widget.id} widget={widget} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="instances" className="mt-6 space-y-4">
        {credentialStatus !== "active" ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300/40 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <span className="inline-flex items-center gap-2">
              <KeyRoundIcon className="size-4" />
              {credentialStatus === null
                ? "Connect a git token to create user and repo widget instances."
                : "Your git token needs reconnecting - instances may not render live data."}
            </span>
            <Button asChild size="sm" variant="outline">
              <Link to="/settings">Open Settings</Link>
            </Button>
          </div>
        ) : null}

        {instances.length === 0 ? (
          <Empty
            title="No instances yet"
            body="Use a user or repo widget to create an instance bound to a git target."
            action={
              <Button asChild size="sm" variant="outline">
                <Link to="/widgets">Browse widgets</Link>
              </Button>
            }
          />
        ) : (
          instances.map((instance) => (
            <InstanceRow key={instance.id} instance={instance} />
          ))
        )}
      </TabsContent>

      <TabsContent value="liked" className="mt-6">
        {liked.length === 0 ? (
          <Empty
            title="Nothing liked yet"
            body="Like widgets in the library to keep them here."
          />
        ) : (
          <WidgetGrid widgets={liked} />
        )}
      </TabsContent>

      <TabsContent value="forks" className="mt-6">
        {forks.length === 0 ? (
          <Empty
            title="No forks yet"
            body="Fork a widget to start from someone else's work."
          />
        ) : (
          <WidgetGrid widgets={forks} />
        )}
      </TabsContent>
    </Tabs>
  );
}

function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <PackageOpenIcon className="size-6" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}
