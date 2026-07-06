import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router";
import { GitHubIcon } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { authClient } from "~/services/auth-client";

interface PromptOptions {
  title?: string;
  description?: string;
  redirectTo?: string;
}

type PromptFn = (options?: PromptOptions) => void;

const LoginPromptContext = createContext<PromptFn | null>(null);

export function useLoginPrompt(): PromptFn {
  const prompt = useContext(LoginPromptContext);
  if (!prompt) {
    throw new Error("useLoginPrompt must be used within a LoginPromptProvider");
  }
  return prompt;
}

const DEFAULT_TITLE = "Sign in to continue";
const DEFAULT_DESCRIPTION =
  "You need a GitHub account to do that - it only takes a second, and you’ll pick up right where you left off.";

export function LoginPromptProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<PromptOptions>({});
  const [loading, setLoading] = useState(false);

  const promptLogin = useCallback<PromptFn>((next) => {
    setOptions(next ?? {});
    setLoading(false);
    setOpen(true);
  }, []);

  const value = useMemo(() => promptLogin, [promptLogin]);

  async function signIn() {
    setLoading(true);
    const redirectTo =
      options.redirectTo ?? location.pathname + location.search;
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: redirectTo,
      });
    } catch {
      setLoading(false);
    }
  }

  return (
    <LoginPromptContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{options.title ?? DEFAULT_TITLE}</DialogTitle>
            <DialogDescription>
              {options.description ?? DEFAULT_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={signIn}
              disabled={loading}
            >
              <GitHubIcon />
              {loading ? "Redirecting…" : "Continue with GitHub"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LoginPromptContext.Provider>
  );
}
