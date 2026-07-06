import { Trash2Icon } from "lucide-react";
import { useFetcher } from "react-router";
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

export function RevokeInstanceDialog({
  instanceId,
  target,
}: {
  instanceId: string;
  target: string;
}) {
  const fetcher = useFetcher();
  const revoking = fetcher.state !== "idle";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={revoking}>
          <Trash2Icon />
          Revoke
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke this instance?</AlertDialogTitle>
          <AlertDialogDescription>
            The embed URL for <span className="font-medium">{target}</span> will
            stop rendering and serve a “deleted” image. This can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
            onClick={() =>
              fetcher.submit(
                { intent: "delete", instanceId },
                { method: "post", action: "/resource/instances" },
              )
            }
          >
            Revoke instance
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
