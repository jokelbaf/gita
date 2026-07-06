import { useState } from "react";
import type { CredentialSummary } from "~/services/git/index.server";
import { CredentialForm } from "./credential-form";
import { CredentialSummaryCard } from "./credential-summary";

interface SettingsPanelProps {
  credential: CredentialSummary | null;
  error?: string;
  warnings: string[];
}

export function SettingsPanel({
  credential,
  error,
  warnings,
}: SettingsPanelProps) {
  const [editing, setEditing] = useState(false);

  if (credential && !editing) {
    return (
      <CredentialSummaryCard
        credential={credential}
        onReplace={() => setEditing(true)}
      />
    );
  }

  return (
    <CredentialForm
      defaultProvider={credential?.provider ?? "GITHUB"}
      defaultBaseUrl={credential?.baseUrl ?? "https://github.com"}
      error={error}
      warnings={warnings}
      onCancel={credential ? () => setEditing(false) : undefined}
    />
  );
}
