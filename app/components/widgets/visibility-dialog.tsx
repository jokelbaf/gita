import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useSubmit } from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import type { Visibility } from "~/lib/widget";

export function VisibilityDialog({
  visibility,
  slug,
}: {
  visibility: Visibility;
  slug: string;
}) {
  const submit = useSubmit();

  function apply(next: Visibility) {
    submit(
      { intent: "visibility", visibility: next },
      { method: "post", action: `/widgets/${slug}` },
    );
  }

  if (visibility === "PRIVATE") {
    return (
      <Button
        variant="outline"
        size="icon"
        aria-label="Make public"
        onClick={() => apply("PUBLIC")}
      >
        <EyeOffIcon />
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Make private">
          <EyeIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Make this widget private?</AlertDialogTitle>
          <AlertDialogDescription>
            It will disappear from the library for everyone else and can no
            longer be used, forked, or liked by others. Existing embed URLs and
            instances keep rendering.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => apply("PRIVATE")}>
            Make private
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
