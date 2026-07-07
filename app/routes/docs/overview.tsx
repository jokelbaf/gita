import { Link } from "react-router";
import { DocsHeader, Section } from "~/components/docs/docs-ui";
import { DOCS_NAV } from "~/lib/docs-nav";

const BLURBS: Record<string, string> = {
  "/docs/embedding": "Drop a widget into a README with a Markdown image.",
  "/docs/arguments": "Configure a widget with typed query-string args.",
  "/docs/data": "The props and git data your Widget receives.",
  "/docs/authoring": "Write your own widget in the live editor.",
  "/docs/caching": "Cache lifetimes and how refreshes work.",
  "/docs/api": "Drive gita over HTTP with a personal API key.",
  "/docs/mcp": "Connect Claude (or any MCP client) to gita.",
};

export default function DocsOverview() {
  const cards = DOCS_NAV.flatMap((group) => group.items).filter(
    (item) => item.to !== "/docs",
  );

  return (
    <>
      <DocsHeader
        title="Documentation"
        lead="gita turns React components into cached images you can embed anywhere - and drive by hand, from the editor, or from an AI."
      />

      <Section title="Start here">
        <p>
          Every widget renders to an image at a stable URL. Browse the{" "}
          <Link to="/widgets" className="text-primary hover:underline">
            library
          </Link>
          , open one, and click <strong>Use</strong> to copy a README snippet -
          or open the{" "}
          <Link to="/widgets/new" className="text-primary hover:underline">
            editor
          </Link>{" "}
          to build your own. To automate any of that, create an API key in{" "}
          <Link to="/settings" className="text-primary hover:underline">
            Settings
          </Link>{" "}
          and point the{" "}
          <Link to="/docs/mcp" className="text-primary hover:underline">
            MCP server
          </Link>{" "}
          or{" "}
          <Link to="/docs/api" className="text-primary hover:underline">
            REST API
          </Link>{" "}
          at it.
        </p>
      </Section>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
          >
            <p className="font-medium group-hover:text-primary">{item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {BLURBS[item.to]}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
