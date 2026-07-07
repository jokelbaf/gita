import { Link } from "react-router";
import { Code, DocsHeader, Section, Snippet } from "~/components/docs/docs-ui";
import { highlightSnippets } from "~/services/highlight.server";
import type { Route } from "./+types/embedding";

const GENERIC_WIDGET_MARKDOWN = `![Pill Badge](https://gita.jokelbaf.dev/api/widget/public/pill-badge?label=build&value=passing)`;

export async function loader() {
  return {
    snippets: await highlightSnippets({
      generic: { code: GENERIC_WIDGET_MARKDOWN, lang: "markdown" },
    }),
  };
}

export default function DocsEmbedding({ loaderData }: Route.ComponentProps) {
  const { snippets } = loaderData;
  return (
    <>
      <DocsHeader
        title="Embedding a widget"
        lead="Every widget renders to an image at a URL - embed it anywhere Markdown images work."
      />

      <Section>
        <p>
          To drop a widget into a README, paste a Markdown image pointing at its
          render URL. Open any widget and click <strong>Use</strong> to get a
          ready-to-copy snippet with both the raw URL and the Markdown.
        </p>
        <Snippet
          label="Generic widget"
          code={GENERIC_WIDGET_MARKDOWN}
          html={snippets.generic}
        />
        <p>
          Because the output is a plain image, it works in profile READMEs, repo
          READMEs, issues, and on the web. GitHub proxies images through its
          camo cache, so refreshes follow the{" "}
          <Link to="/docs/caching" className="text-primary hover:underline">
            cache lifetimes
          </Link>
          .
        </p>
      </Section>

      <Section title="Widget types">
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Generic</strong> widgets are one shared URL, configured via{" "}
            <Link to="/docs/arguments" className="text-primary hover:underline">
              query-string args
            </Link>
            .
          </li>
          <li>
            <strong>User</strong> and <strong>repo</strong> widgets are bound to
            a git target and embedded through an <em>instance</em> with an
            unguessable id (<Code>/api/widget/user/:id</Code> or{" "}
            <Code>/api/widget/repo/:id</Code>) - created from the Use flow, the{" "}
            <Link to="/docs/api" className="text-primary hover:underline">
              REST API
            </Link>
            , or an AI.
          </li>
        </ul>
      </Section>
    </>
  );
}
