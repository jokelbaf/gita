import { Link } from "react-router";
import {
  Callout,
  Code,
  DocsHeader,
  Section,
  Snippet,
} from "~/components/docs/docs-ui";
import { MCP_TOOL_SUMMARIES } from "~/services/api/mcp.server";
import { highlightSnippets } from "~/services/highlight.server";
import type { Route } from "./+types/mcp";

const CLAUDE_CODE_SNIPPET = `claude mcp add --transport http gita \\
  https://gita.jokelbaf.dev/api/mcp \\
  --header "Authorization: Bearer gita_xxx"`;

const CLAUDE_DESKTOP_SNIPPET = `{
  "mcpServers": {
    "gita": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://gita.jokelbaf.dev/api/mcp",
        "--header", "Authorization: Bearer gita_xxx"
      ]
    }
  }
}`;

export async function loader() {
  return {
    tools: MCP_TOOL_SUMMARIES,
    snippets: await highlightSnippets({
      code: { code: CLAUDE_CODE_SNIPPET, lang: "bash" },
      desktop: { code: CLAUDE_DESKTOP_SNIPPET, lang: "json" },
    }),
  };
}

export default function DocsMcp({ loaderData }: Route.ComponentProps) {
  const { tools, snippets } = loaderData;
  return (
    <>
      <DocsHeader
        title="AI & MCP"
        lead="gita ships a remote MCP server, so you can tell an AI on your machine to build and manage widgets for you."
      />

      <Section>
        <p>
          The server lives at <Code>/api/mcp</Code> and speaks the{" "}
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            Model Context Protocol
          </a>{" "}
          over HTTP. Point any MCP client at it with a{" "}
          <Link to="/settings" className="text-primary hover:underline">
            personal API key
          </Link>{" "}
          and it can browse the library and create, edit, fork, and manage your
          widgets - all owner-authorized, exactly like the UI.
        </p>
      </Section>

      <Section title="Connect Claude Code">
        <p>
          One command registers gita as a remote MCP server with your key in the
          auth header:
        </p>
        <Snippet
          label="Terminal"
          code={CLAUDE_CODE_SNIPPET}
          html={snippets.code}
        />
      </Section>

      <Section title="Connect Claude Desktop">
        <p>
          Add gita to <Code>claude_desktop_config.json</Code>. The{" "}
          <Code>mcp-remote</Code> bridge forwards your key to the HTTP server:
        </p>
        <Snippet
          label="claude_desktop_config.json"
          code={CLAUDE_DESKTOP_SNIPPET}
          html={snippets.desktop}
        />
      </Section>

      <Section title="Tools">
        <p>Once connected, the model can call these tools:</p>
        <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {tools.map((tool) => (
                <tr key={tool.name}>
                  <td className="px-4 py-2.5 align-top font-mono text-xs whitespace-nowrap">
                    {tool.name}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {tool.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Try it">
        <p>After connecting, just ask in natural language - for example:</p>
        <blockquote className="border-l-2 border-primary/40 pl-4 text-foreground/80 italic">
          “Create a public gita widget that shows a rounded progress bar with a
          label and percent argument, then give me the README markdown.”
        </blockquote>
        <Callout title="User & repo widgets need a git token">
          To create instances that render live GitHub data, connect a token in{" "}
          <Link to="/settings" className="text-primary hover:underline">
            Settings
          </Link>
          . Generic widgets need no token.
        </Callout>
      </Section>
    </>
  );
}
