import { Code, DocsHeader, Section, Snippet } from "~/components/docs/docs-ui";
import { highlightSnippets } from "~/services/highlight.server";
import type { Route } from "./+types/arguments";

const GENERIC_ARGS_MARKDOWN = `![Stat](https://gita.jokelbaf.dev/api/widget/public/stat-counter?label=Stars&value=1280&color=%23f59e0b)`;

export async function loader() {
  return {
    snippets: await highlightSnippets({
      args: { code: GENERIC_ARGS_MARKDOWN, lang: "markdown" },
    }),
  };
}

export default function DocsArguments({ loaderData }: Route.ComponentProps) {
  const { snippets } = loaderData;
  return (
    <>
      <DocsHeader
        title="How template args work"
        lead="Each widget declares a typed argument schema; how you set values depends on its type."
      />

      <Section>
        <p>
          Every argument has a name, a type (<Code>string</Code>,{" "}
          <Code>number</Code>, <Code>boolean</Code>, <Code>enum</Code>,{" "}
          <Code>color</Code>), a default, and optional constraints.
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong>Generic widgets</strong> take their args as{" "}
            <strong>query-string parameters</strong>. Anything you omit falls
            back to its default, and an invalid value renders a small error
            image rather than breaking the page.
          </li>
          <li>
            <strong>User &amp; repo widgets</strong> are bound to a git target
            and configured once, when you create an <em>instance</em>. Their
            embed URL is a stable, unguessable id - no query string.
          </li>
        </ul>
        <Snippet
          label="Overriding args on a generic widget"
          code={GENERIC_ARGS_MARKDOWN}
          html={snippets.args}
        />
        <p className="text-sm text-muted-foreground">
          Remember to URL-encode values - a <Code>#</Code> in a color becomes{" "}
          <Code>%23</Code>. The full argument reference for any widget is on its
          detail page, under “Arguments”.
        </p>
      </Section>
    </>
  );
}
