import { KeyRoundIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function ConnectTokenBanner({
  reason = "missing",
}: {
  reason?: "missing" | "invalid";
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <KeyRoundIcon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {reason === "invalid"
            ? "Your git token needs reconnecting"
            : "Connect a git token first"}
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          User and repo widgets read live data with your own access token. Add a
          read-only token in Settings to continue.
        </p>
      </div>
      <Button asChild>
        <Link to="/settings">Go to Settings</Link>
      </Button>
    </div>
  );
}
