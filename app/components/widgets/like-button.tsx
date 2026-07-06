import { HeartIcon } from "lucide-react";
import { useFetcher } from "react-router";
import { useLoginPrompt } from "~/components/auth/login-prompt";
import { Button } from "~/components/ui/button";
import { useOptionalUser } from "~/hooks/use-optional-user";
import { cn } from "~/lib/utils";

interface LikeResult {
  liked: boolean;
  likesCount: number;
}

interface LikeButtonProps {
  widgetId: string;
  name: string;
  likesCount: number;
  liked: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function LikeButton({
  widgetId,
  name,
  likesCount,
  liked,
  size = "sm",
  className,
}: LikeButtonProps) {
  const user = useOptionalUser();
  const promptLogin = useLoginPrompt();
  const fetcher = useFetcher<LikeResult>();

  const pending = fetcher.formData?.get("intent");
  const serverLiked = fetcher.data?.liked ?? liked;
  const serverCount = fetcher.data?.likesCount ?? likesCount;
  const displayedLiked = pending ? pending === "like" : serverLiked;
  const displayedCount = pending
    ? serverCount + (pending === "like" ? 1 : -1)
    : serverCount;

  function onClick() {
    if (!user) {
      promptLogin({
        title: "Sign in to like widgets",
        description: `Like “${name}” and keep it handy - sign in with GitHub to continue.`,
      });
      return;
    }
    fetcher.submit(
      { widgetId, intent: displayedLiked ? "unlike" : "like" },
      { method: "post", action: "/resource/like" },
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onClick}
      aria-pressed={displayedLiked}
      aria-label={displayedLiked ? "Unlike" : "Like"}
      className={cn(
        displayedLiked &&
          "border-rose-300 text-rose-600 dark:border-rose-900 dark:text-rose-400",
        className,
      )}
    >
      <HeartIcon className={cn(displayedLiked && "fill-current")} />
      <span className="tabular-nums">{displayedCount}</span>
    </Button>
  );
}
