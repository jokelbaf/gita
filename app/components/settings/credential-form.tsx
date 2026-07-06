import {
  AlertTriangleIcon,
  ExternalLinkIcon,
  KeyRoundIcon,
} from "lucide-react";
import { Form, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { GitProviderId } from "~/services/git/index.server";

interface CredentialFormProps {
  defaultProvider: GitProviderId;
  defaultBaseUrl: string;
  error?: string;
  warnings: string[];
  onCancel?: () => void;
}

export function CredentialForm({
  defaultProvider,
  defaultBaseUrl,
  error,
  warnings,
  onCancel,
}: CredentialFormProps) {
  const navigation = useNavigation();
  const saving =
    navigation.state !== "idle" &&
    navigation.formData?.get("intent") === "save";

  return (
    <Form method="post" className="space-y-5 rounded-xl border p-5">
      <input type="hidden" name="intent" value="save" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="provider">Provider</Label>
          <Select name="provider" defaultValue={defaultProvider}>
            <SelectTrigger id="provider" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GITHUB">GitHub</SelectItem>
              <SelectItem value="GITLAB" disabled>
                GitLab (coming soon)
              </SelectItem>
              <SelectItem value="GITEA" disabled>
                Gitea (coming soon)
              </SelectItem>
              <SelectItem value="FORGEJO" disabled>
                Forgejo (coming soon)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input
            id="baseUrl"
            name="baseUrl"
            defaultValue={defaultBaseUrl}
            placeholder="https://github.com"
          />
          <p className="text-xs text-muted-foreground">
            Change only for a self-hosted instance.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="token">Access token</Label>
        <Input
          id="token"
          name="token"
          type="password"
          autoComplete="off"
          required
          placeholder="ghp_… or github_pat_…"
          aria-invalid={Boolean(error)}
        />
        <p className="text-xs text-muted-foreground">
          Prefer a{" "}
          <a
            href="https://github.com/settings/tokens?type=beta"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:text-foreground"
          >
            fine-grained, read-only, expiring token
            <ExternalLinkIcon className="size-3" />
          </a>{" "}
          with read access to your profile (and repositories, for repo widgets).
        </p>
      </div>

      {error ? (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {warnings.length > 0 ? (
        <ul className="space-y-1 rounded-lg border border-amber-300/40 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
          {warnings.map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={saving}>
          <KeyRoundIcon />
          {saving ? "Validating…" : "Save token"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </Form>
  );
}
