import { PlusIcon } from "lucide-react";
import { Link } from "react-router";
import { useLoginPrompt } from "~/components/auth/login-prompt";
import { Button } from "~/components/ui/button";
import { useOptionalUser } from "~/hooks/use-optional-user";

export function NewWidgetButton() {
  const user = useOptionalUser();
  const promptLogin = useLoginPrompt();

  if (user) {
    return (
      <Button asChild>
        <Link to="/widgets/new">
          <PlusIcon />
          New widget
        </Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={() =>
        promptLogin({
          title: "Sign in to create a widget",
          description:
            "Author your own widget and publish it to the library - sign in with GitHub to continue.",
          redirectTo: "/widgets/new",
        })
      }
    >
      <PlusIcon />
      New widget
    </Button>
  );
}
