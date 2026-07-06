import { GitForkIcon, PencilIcon, SparklesIcon } from "lucide-react";
import { Link } from "react-router";
import { useLoginPrompt } from "~/components/auth/login-prompt";
import { Button } from "~/components/ui/button";
import { UseDialog } from "~/components/use/use-dialog";
import { useOptionalUser } from "~/hooks/use-optional-user";
import type { WidgetArg } from "~/services/args";
import type { WidgetCard } from "~/lib/widget";
import { DeleteWidgetDialog } from "./delete-widget-dialog";
import { ForkDialog } from "./fork-dialog";
import { LikeButton } from "./like-button";
import { VisibilityDialog } from "./visibility-dialog";

interface WidgetActionsProps {
  widget: WidgetCard;
  argsSchema: WidgetArg[];
}

export function WidgetActions({ widget, argsSchema }: WidgetActionsProps) {
  const user = useOptionalUser();
  const promptLogin = useLoginPrompt();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <LikeButton
        widgetId={widget.id}
        name={widget.name}
        likesCount={widget.likesCount}
        liked={widget.likedByViewer}
        size="default"
      />

      {user ? (
        <UseDialog
          slug={widget.slug}
          name={widget.name}
          type={widget.type}
          argsSchema={argsSchema}
        />
      ) : (
        <Button
          onClick={() =>
            promptLogin({
              title: "Sign in to use this widget",
              description: `Configure “${widget.name}” and get an embeddable URL - sign in with GitHub to continue.`,
            })
          }
        >
          <SparklesIcon />
          Use
        </Button>
      )}

      {user ? (
        <ForkDialog slug={widget.slug} name={widget.name} />
      ) : (
        <Button
          variant="outline"
          onClick={() =>
            promptLogin({
              title: "Sign in to fork this widget",
              description: `Fork “${widget.name}” into your own editable copy - sign in with GitHub to continue.`,
            })
          }
        >
          <GitForkIcon />
          Fork
        </Button>
      )}

      {widget.isOwner ? (
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Edit" asChild>
            <Link to={`/widgets/${widget.slug}/edit`}>
              <PencilIcon />
            </Link>
          </Button>
          <VisibilityDialog visibility={widget.visibility} slug={widget.slug} />
          <DeleteWidgetDialog name={widget.name} slug={widget.slug} />
        </div>
      ) : null}
    </div>
  );
}
