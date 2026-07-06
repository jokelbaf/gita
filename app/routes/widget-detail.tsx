import { ArrowLeftIcon, GitForkIcon, HeartIcon } from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ArgsTable } from "~/components/widgets/args-table";
import { SourceView } from "~/components/widgets/source-view";
import { TypeBadge } from "~/components/widgets/type-badge";
import { WidgetActions } from "~/components/widgets/widget-actions";
import { WidgetPreview } from "~/components/widgets/widget-preview";
import { formatDate } from "~/lib/format";
import { typeDescription, widgetPreviewUrl } from "~/lib/widget";
import { redirect } from "react-router";
import { userContext } from "~/services/context";
import { notFound, toErrorResponse } from "~/services/errors";
import { highlightSource } from "~/services/highlight.server";
import { requireUser } from "~/services/session.server";
import {
  deleteWidget,
  setWidgetVisibility,
} from "~/services/widget-editor.server";
import { getWidgetDetail } from "~/services/widgets.server";
import type { Route } from "./+types/widget-detail";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "Widget - gita" }];
  return [
    { title: `${loaderData.widget.name} - gita` },
    { name: "description", content: loaderData.widget.description },
  ];
}

export async function loader({ params, context }: Route.LoaderArgs) {
  const user = context.get(userContext);
  const widget = await getWidgetDetail(params.slug, user?.id ?? null);
  if (!widget) throw notFound("That widget doesn’t exist or is private.");
  const highlighted = await highlightSource(widget.source);
  return { widget, highlighted };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const user = requireUser(context.get(userContext), request);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  try {
    if (intent === "delete") {
      await deleteWidget(params.slug, user.id);
      return redirect("/dashboard");
    }
    if (intent === "visibility") {
      const visibility =
        form.get("visibility") === "PUBLIC" ? "PUBLIC" : "PRIVATE";
      await setWidgetVisibility(params.slug, user.id, visibility);
      return { ok: true };
    }
    return { ok: false };
  } catch (error) {
    throw toErrorResponse(error);
  }
}

export default function WidgetDetail({ loaderData }: Route.ComponentProps) {
  const { widget, highlighted } = loaderData;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Link
        to="/widgets"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Library
      </Link>

      <header className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{widget.name}</h1>
          <TypeBadge type={widget.type} />
          {widget.visibility === "PRIVATE" ? (
            <Badge variant="outline" className="text-muted-foreground">
              Private
            </Badge>
          ) : null}
        </div>
        <p className="max-w-2xl text-muted-foreground">{widget.description}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Link
            to={`/u/${widget.author.username}`}
            className="flex items-center gap-2 hover:text-foreground"
          >
            <Avatar className="size-6">
              {widget.author.avatarUrl ? (
                <AvatarImage
                  src={widget.author.avatarUrl}
                  alt={widget.author.name}
                />
              ) : null}
              <AvatarFallback className="text-[10px]">
                {widget.author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {widget.author.username}
          </Link>
          <span className="inline-flex items-center gap-1">
            <HeartIcon className="size-4" />
            {widget.likesCount}
          </span>
          {widget.isFork ? (
            <span className="inline-flex items-center gap-1">
              <GitForkIcon className="size-4" />
              {widget.forkedFromSlug ? (
                <>
                  Forked from{" "}
                  <Link
                    to={`/widgets/${widget.forkedFromSlug}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {widget.forkedFromName}
                  </Link>
                </>
              ) : (
                <>Forked from {widget.forkedFromName ?? "a deleted widget"}</>
              )}
            </span>
          ) : null}
        </div>

        <WidgetActions widget={widget} argsSchema={widget.argsSchema} />
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Preview
            </h2>
            <WidgetPreview
              src={widgetPreviewUrl(widget.slug)}
              alt={`${widget.name} preview`}
              className="min-h-64 rounded-xl ring-1 ring-foreground/10"
              padded
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Source
            </h2>
            <SourceView html={highlighted} raw={widget.source} />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Arguments
            </h2>
            <ArgsTable args={widget.argsSchema} />
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="space-y-4 rounded-xl border p-5 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">
                Type
              </span>
              <p>{typeDescription(widget.type)}</p>
            </div>
            <Separator />
            <DetailRow label="Likes" value={String(widget.likesCount)} />
            <DetailRow label="Forks" value={String(widget.forkCount)} />
            <DetailRow label="Created" value={formatDate(widget.createdAt)} />
            <DetailRow label="Updated" value={formatDate(widget.updatedAt)} />
            <DetailRow label="Author" value={`@${widget.author.username}`} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
