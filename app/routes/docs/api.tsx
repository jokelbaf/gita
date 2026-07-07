import { Link } from "react-router";
import {
  Callout,
  Code,
  DocsHeader,
  EndpointTable,
  Section,
  Snippet,
  type Endpoint,
} from "~/components/docs/docs-ui";
import { highlightSnippets } from "~/services/highlight.server";
import type { Route } from "./+types/api";

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/v1/me",
    description: "The account behind the key.",
  },
  {
    method: "GET",
    path: "/api/v1/widgets",
    description:
      "List/search widgets (search, type, sort, forksOnly, mine, cursor, limit).",
  },
  { method: "POST", path: "/api/v1/widgets", description: "Create a widget." },
  {
    method: "GET",
    path: "/api/v1/widgets/:slug",
    description: "A widget's full definition.",
  },
  {
    method: "PATCH",
    path: "/api/v1/widgets/:slug",
    description: "Update fields you pass (partial).",
  },
  {
    method: "DELETE",
    path: "/api/v1/widgets/:slug",
    description: "Delete a widget you own.",
  },
  {
    method: "POST",
    path: "/api/v1/widgets/:slug/fork",
    description: "Fork into a private copy.",
  },
  {
    method: "PUT",
    path: "/api/v1/widgets/:slug/visibility",
    description: "Set PUBLIC or PRIVATE.",
  },
  {
    method: "GET",
    path: "/api/v1/instances",
    description: "Your user/repo instances.",
  },
  {
    method: "POST",
    path: "/api/v1/instances",
    description: "Create an instance bound to a git target.",
  },
  {
    method: "DELETE",
    path: "/api/v1/instances/:id",
    description: "Delete an instance.",
  },
];

const AUTH_SNIPPET = `curl https://gita.jokelbaf.dev/api/v1/me \\
  -H "Authorization: Bearer gita_xxx"`;

const CREATE_SNIPPET = `curl -X POST https://gita.jokelbaf.dev/api/v1/widgets \\
  -H "Authorization: Bearer gita_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Build Badge",
    "type": "GENERIC",
    "visibility": "PUBLIC",
    "source": "function Widget({ label, value }) { return <div style={{ display: \\"flex\\", padding: 16, fontFamily: \\"Inter\\" }}>{label}: {value}</div>; }",
    "argsSchema": [
      { "name": "label", "label": "Label", "type": "string", "default": "build", "required": false, "description": "" },
      { "name": "value", "label": "Value", "type": "string", "default": "passing", "required": false, "description": "" }
    ]
  }'`;

const RESPONSE_SNIPPET = `{
  "slug": "build-badge",
  "name": "Build Badge",
  "type": "GENERIC",
  "visibility": "PUBLIC",
  "author": "you",
  "source": "function Widget({ label, value }) { ... }",
  "argsSchema": [ ... ],
  "previewUrl": "https://gita.jokelbaf.dev/api/widget/public/build-badge",
  "embed": {
    "url": "https://gita.jokelbaf.dev/api/widget/public/build-badge",
    "markdown": "![Build Badge](https://gita.jokelbaf.dev/api/widget/public/build-badge)"
  }
}`;

export async function loader() {
  return {
    snippets: await highlightSnippets({
      auth: { code: AUTH_SNIPPET, lang: "bash" },
      create: { code: CREATE_SNIPPET, lang: "bash" },
      response: { code: RESPONSE_SNIPPET, lang: "json" },
    }),
  };
}

export default function DocsApi({ loaderData }: Route.ComponentProps) {
  const { snippets } = loaderData;
  return (
    <>
      <DocsHeader
        title="REST API"
        lead="A small JSON API over the full widget lifecycle, authenticated by a personal API key."
      />

      <Section title="Authentication">
        <p>
          Create a key in{" "}
          <Link to="/settings" className="text-primary hover:underline">
            Settings, Programmatic access
          </Link>
          , then send it as a bearer token on every request. A key acts as you,
          so every mutation is owner-authorized exactly like the UI.
        </p>
        <Snippet
          label="Verify your key"
          code={AUTH_SNIPPET}
          html={snippets.auth}
        />
        <Callout title="Keep keys secret">
          A key is shown once at creation and grants full access to your
          account. Store it like a password and revoke it if it leaks.
        </Callout>
      </Section>

      <Section title="Endpoints">
        <p>
          Base URL is your gita origin. Unlike the render endpoints, these
          return honest status codes with a JSON body: <Code>2xx</Code> on
          success, <Code>400/401/403/404</Code> on error as{" "}
          <Code>{'{ "error": { "kind", "message", "details?" } }'}</Code>.
        </p>
        <EndpointTable rows={ENDPOINTS} />
      </Section>

      <Section title="Creating a widget">
        <p>
          Post a widget definition. <Code>type</Code> defaults to{" "}
          <Code>GENERIC</Code> and <Code>visibility</Code> to{" "}
          <Code>PRIVATE</Code>. The response is the created widget, including
          its embed URL and Markdown.
        </p>
        <Snippet
          label="POST /api/v1/widgets"
          code={CREATE_SNIPPET}
          html={snippets.create}
        />
        <Snippet
          label="Response"
          code={RESPONSE_SNIPPET}
          html={snippets.response}
        />
        <p className="text-sm text-muted-foreground">
          <Code>PATCH</Code> the same shape to update - only the fields you send
          change, so <Code>{'{ "name": "New name" }'}</Code> keeps the source
          and args. See{" "}
          <Link to="/docs/data" className="text-primary hover:underline">
            Widget data
          </Link>{" "}
          for the props your source receives and{" "}
          <Link to="/docs/arguments" className="text-primary hover:underline">
            Template args
          </Link>{" "}
          for the arg schema shape.
        </p>
      </Section>

      <Section title="Prefer natural language?">
        <p>
          The same operations are exposed as MCP tools, so you can point Claude
          (or any MCP client) at gita and just describe what you want. See{" "}
          <Link to="/docs/mcp" className="text-primary hover:underline">
            AI &amp; MCP
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
