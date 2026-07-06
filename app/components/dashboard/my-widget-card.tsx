import { HeartIcon, LockIcon, PencilIcon } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { DeleteWidgetDialog } from "~/components/widgets/delete-widget-dialog";
import { TypeBadge } from "~/components/widgets/type-badge";
import { VisibilityDialog } from "~/components/widgets/visibility-dialog";
import { WidgetPreview } from "~/components/widgets/widget-preview";
import {
  widgetPreviewUrl,
  type WidgetCard as WidgetCardData,
} from "~/lib/widget";

export function MyWidgetCard({ widget }: { widget: WidgetCardData }) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Link to={`/widgets/${widget.slug}`} aria-label={`Open ${widget.name}`}>
        <WidgetPreview
          src={widgetPreviewUrl(widget.slug)}
          alt={`${widget.name} preview`}
          className="h-36 border-b"
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
          {widget.description || "No description."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <HeartIcon className="size-4" />
            {widget.likesCount}
          </span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" aria-label="Edit" asChild>
              <Link to={`/widgets/${widget.slug}/edit`}>
                <PencilIcon />
              </Link>
            </Button>
            <VisibilityDialog
              visibility={widget.visibility}
              slug={widget.slug}
            />
            <DeleteWidgetDialog name={widget.name} slug={widget.slug} />
          </div>
        </div>
      </div>
    </Card>
  );
}
