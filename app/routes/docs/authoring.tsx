import { Link } from "react-router";
import { Code, DocsHeader, Section, Snippet } from "~/components/docs/docs-ui";
import { highlightSnippets } from "~/services/highlight.server";
import type { Route } from "./+types/authoring";

const MINIMAL_WIDGET_EXAMPLE = `function Widget({ label, color }) {
  return (
    <div style={{ display: 'flex', padding: 16, color }}>
      {label}
    </div>
  );
}`;

export async function loader() {
  return {
    snippets: await highlightSnippets({
      minimal: { code: MINIMAL_WIDGET_EXAMPLE, lang: "tsx" },
    }),
  };
}

export default function DocsAuthoring({ loaderData }: Route.ComponentProps) {
  const { snippets } = loaderData;
  return (
    <>
      <DocsHeader
        title="Authoring a widget"
        lead="A widget is a single React component named Widget that returns inline-styled JSX."
      />

      <Section>
        <p>
          It runs in a hardened sandbox - no imports, network, or filesystem -
          and is laid out to SVG with{" "}
          <a
            href="https://github.com/vercel/satori"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            Satori
          </a>
          , so use flexbox and explicit sizes.
        </p>
        <Snippet
          label="A minimal widget"
          code={MINIMAL_WIDGET_EXAMPLE}
          html={snippets.minimal}
        />
        <p>
          Your component receives its resolved args as props. User and repo
          widgets also receive a <Code>data</Code> prop with normalized git data
          (see{" "}
          <Link to="/docs/data" className="text-primary hover:underline">
            Widget data
          </Link>
          ). Open the{" "}
          <Link to="/widgets/new" className="text-primary hover:underline">
            editor
          </Link>{" "}
          to write one with a live preview, define its argument schema, and
          publish it. New widgets start private; flip visibility to public to
          list them in the library.
        </p>
        <p className="text-sm text-muted-foreground">
          For user/repo widgets you’ll need a git token - add one in{" "}
          <Link to="/settings" className="text-primary hover:underline">
            Settings
          </Link>
          . Prefer to build from your own machine? An AI can author widgets for
          you through the{" "}
          <Link to="/docs/mcp" className="text-primary hover:underline">
            MCP server
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
