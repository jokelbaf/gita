import { GitForkIcon, LockIcon } from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import {
  widgetPreviewUrl,
  type WidgetCard as WidgetCardData,
} from "~/lib/widget";
import { LikeButton } from "./like-button";
import { TypeBadge } from "./type-badge";
import { WidgetPreview } from "./widget-preview";

export function WidgetCard({ widget }: { widget: WidgetCardData }) {
  const initials = widget.author.name.slice(0, 2).toUpperCase();

  return (
    <Card className="group/widget gap-0 py-0 transition-shadow hover:shadow-md">
      <Link
        to={`/widgets/${widget.slug}`}
        className="block focus-visible:outline-none"
        aria-label={`Open ${widget.name}`}
      >
        <WidgetPreview
          src={widgetPreviewUrl(widget.slug)}
          alt={`${widget.name} preview`}
          className="h-44 border-b"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/widgets/${widget.slug}`}
            className="font-heading leading-snug font-medium hover:underline"
          >
            {widget.name}
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            {widget.visibility === "PRIVATE" ? (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <LockIcon />
                Private
              </Badge>
            ) : null}
            <TypeBadge type={widget.type} />
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {widget.description}
        </p>

        {widget.isFork ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <GitForkIcon className="size-3" />
            {widget.forkedFromSlug ? (
              <span>
                Forked from{" "}
                <Link
                  to={`/widgets/${widget.forkedFromSlug}`}
                  className="hover:text-foreground hover:underline"
                >
                  {widget.forkedFromName}
                </Link>
              </span>
            ) : (
              <span>
                Forked from {widget.forkedFromName ?? "a deleted widget"}
              </span>
            )}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Link
            to={`/u/${widget.author.username}`}
            className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Avatar className="size-6">
              {widget.author.avatarUrl ? (
                <AvatarImage
                  src={widget.author.avatarUrl}
                  alt={widget.author.name}
                />
              ) : null}
              <AvatarFallback className="text-[10px]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{widget.author.username}</span>
          </Link>
          <LikeButton
            widgetId={widget.id}
            name={widget.name}
            likesCount={widget.likesCount}
            liked={widget.likedByViewer}
          />
        </div>
      </div>
    </Card>
  );
}
