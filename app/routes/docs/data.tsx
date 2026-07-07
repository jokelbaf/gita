import {
  Code,
  DocsHeader,
  FieldTable,
  Section,
  Snippet,
} from "~/components/docs/docs-ui";
import { highlightSnippets } from "~/services/highlight.server";
import {
  GIT_REPO_FIELDS,
  GIT_USER_FIELDS,
  WIDGET_RUNTIME_TYPES,
} from "~/services/widget-runtime";
import type { Route } from "./+types/data";

const RUNTIME_PROPS_EXAMPLE = `// Generic
function Widget({ label, color }) {}

// User
function Widget({ accent, data }) {
  const user = data.user;
}

// Repo
function Widget({ accent, data }) {
  const repo = data.repo;
}`;

const USER_WIDGET_EXAMPLE = `function Widget({ accent, data }: { accent: string; data: { user: GitUser } }) {
  const { profile } = data.user;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 20 }}>
      <span style={{ fontSize: 24, fontWeight: 800, color: accent }}>
        {profile.name || profile.login}
      </span>
      <span>@{profile.login}</span>
      <span>{profile.followers} followers</span>
    </div>
  );
}`;

const REPO_WIDGET_EXAMPLE = `function Widget({ accent, data }: { accent: string; data: { repo: GitRepo } }) {
  const repo = data.repo;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 20 }}>
      <span style={{ fontSize: 20, fontWeight: 800 }}>{repo.meta.fullName}</span>
      <span>{repo.stats.stars} stars · {repo.stats.forks} forks</span>
      <span style={{ color: accent }}>{repo.primaryLanguage}</span>
    </div>
  );
}`;

export async function loader() {
  return {
    snippets: await highlightSnippets({
      runtimeProps: { code: RUNTIME_PROPS_EXAMPLE, lang: "tsx" },
      runtimeTypes: { code: WIDGET_RUNTIME_TYPES, lang: "tsx" },
      userWidget: { code: USER_WIDGET_EXAMPLE, lang: "tsx" },
      repoWidget: { code: REPO_WIDGET_EXAMPLE, lang: "tsx" },
    }),
  };
}

export default function DocsData({ loaderData }: Route.ComponentProps) {
  const { snippets } = loaderData;
  return (
    <>
      <DocsHeader
        title="Widget data"
        lead="What your Widget function receives at render time."
      />

      <Section>
        <p>
          Your <Code>Widget</Code> function receives one props object. For a
          generic widget, that object contains only the template args you
          define. User and repo widgets receive those same args plus a reserved{" "}
          <Code>data</Code> prop.
        </p>
        <Snippet
          label="Runtime props"
          code={RUNTIME_PROPS_EXAMPLE}
          html={snippets.runtimeProps}
        />
        <p>
          The editor preview uses sample data, so selecting User or Repo in the
          Details tab only changes output once your source reads{" "}
          <Code>data.user</Code> or <Code>data.repo</Code>. Real embeds fill the
          same shape from the instance owner’s configured git token.
        </p>
        <Snippet
          label="Copyable local types"
          code={WIDGET_RUNTIME_TYPES}
          html={snippets.runtimeTypes}
        />
      </Section>

      <Section title="Fields">
        <div className="grid gap-4 lg:grid-cols-2">
          <FieldTable title="data.user" fields={GIT_USER_FIELDS} />
          <FieldTable title="data.repo" fields={GIT_REPO_FIELDS} />
        </div>
        <Snippet
          label="User widget example"
          code={USER_WIDGET_EXAMPLE}
          html={snippets.userWidget}
        />
        <Snippet
          label="Repo widget example"
          code={REPO_WIDGET_EXAMPLE}
          html={snippets.repoWidget}
        />
      </Section>
    </>
  );
}
