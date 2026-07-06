import {
  BookOpenIcon,
  ClockIcon,
  CodeIcon,
  ImageIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { CopyButton } from "~/components/copy-button";
import { highlightCode } from "~/services/highlight.server";
import {
  GIT_REPO_FIELDS,
  GIT_USER_FIELDS,
  WIDGET_RUNTIME_TYPES,
} from "~/services/widget-runtime";
import type { Route } from "./+types/docs";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Docs - gita" },
    {
      name: "description",
      content:
        "How to embed gita widgets in a README, configure template args, author your own, and what to expect from caching.",
    },
  ];
}

const SECTIONS = [
  { id: "embed", label: "Embedding", icon: ImageIcon },
  { id: "args", label: "Template args", icon: SlidersHorizontalIcon },
  { id: "data", label: "Widget data", icon: CodeIcon },
  { id: "authoring", label: "Authoring", icon: CodeIcon },
  { id: "caching", label: "Caching", icon: ClockIcon },
] as const;

const GENERIC_WIDGET_MARKDOWN = `![Pill Badge](https://gita.jokelbaf.dev/api/widget/public/pill-badge?label=build&value=passing)`;

const GENERIC_ARGS_MARKDOWN = `![Stat](https://gita.jokelbaf.dev/api/widget/public/stat-counter?label=Stars&value=1280&color=%23f59e0b)`;

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
  const user = data.user;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 20 }}>
      <span style={{ fontSize: 24, fontWeight: 800, color: accent }}>
        {user.name || user.login}
      </span>
      <span>@{user.login}</span>
      <span>{user.followers} followers</span>
    </div>
  );
}`;

const REPO_WIDGET_EXAMPLE = `function Widget({ accent, data }: { accent: string; data: { repo: GitRepo } }) {
  const repo = data.repo;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 20 }}>
      <span style={{ fontSize: 20, fontWeight: 800 }}>{repo.fullName}</span>
      <span>{repo.stars} stars · {repo.forks} forks</span>
      <span style={{ color: accent }}>{repo.primaryLanguage}</span>
    </div>
  );
}`;

const MINIMAL_WIDGET_EXAMPLE = `function Widget({ label, color }) {
  return (
    <div style={{ display: 'flex', padding: 16, color }}>
      {label}
    </div>
  );
}`;

const SNIPPETS = {
  genericWidget: { code: GENERIC_WIDGET_MARKDOWN, lang: "markdown" },
  genericArgs: { code: GENERIC_ARGS_MARKDOWN, lang: "markdown" },
  runtimeProps: { code: RUNTIME_PROPS_EXAMPLE, lang: "tsx" },
  runtimeTypes: { code: WIDGET_RUNTIME_TYPES, lang: "tsx" },
  userWidget: { code: USER_WIDGET_EXAMPLE, lang: "tsx" },
  repoWidget: { code: REPO_WIDGET_EXAMPLE, lang: "tsx" },
  minimalWidget: { code: MINIMAL_WIDGET_EXAMPLE, lang: "tsx" },
} as const;

type SnippetKey = keyof typeof SNIPPETS;
type HighlightedSnippets = Record<SnippetKey, string>;

export async function loader() {
  const entries = await Promise.all(
    Object.entries(SNIPPETS).map(async ([key, snippet]) => [
      key,
      await highlightCode(snippet.code, snippet.lang),
    ]),
  );
  return { snippets: Object.fromEntries(entries) as HighlightedSnippets };
}

export default function Docs({ loaderData }: Route.ComponentProps) {
  const { snippets } = loaderData;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <header className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookOpenIcon className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground">
            Embed a widget, configure it, or author your own.
          </p>
        </div>
      </header>

      <nav className="mt-8 flex flex-wrap gap-2">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon className="size-4" />
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-16">
        <Section id="embed" title="Embedding a widget">
          <p>
            Every widget renders to an image at a URL. To drop one into a
            README, paste a Markdown image pointing at that URL. Open any widget
            and click <strong>Use</strong> to get a ready-to-copy snippet.
          </p>
          <Snippet
            label="Generic widget"
            code={GENERIC_WIDGET_MARKDOWN}
            html={snippets.genericWidget}
          />
          <p>
            Because the output is a plain image, it works anywhere Markdown
            images do - profile READMEs, repo READMEs, issues, and the web.
            GitHub proxies images through its camo cache, so refreshes follow
            the cache lifetimes{" "}
            <a href="#caching" className="text-primary hover:underline">
              described below
            </a>
            .
          </p>
        </Section>

        <Section id="args" title="How template args work">
          <p>
            Each widget declares a typed set of arguments - name, type (
            <Code>string</Code>, <Code>number</Code>, <Code>boolean</Code>,{" "}
            <Code>enum</Code>, <Code>color</Code>), a default, and optional
            constraints. How you set them depends on the widget type:
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
              and configured once when you create an <em>instance</em> via the
              Use flow. Their embed URL is a stable, unguessable id - no query
              string.
            </li>
          </ul>
          <Snippet
            label="Overriding args on a generic widget"
            code={GENERIC_ARGS_MARKDOWN}
            html={snippets.genericArgs}
          />
          <p className="text-sm text-muted-foreground">
            The full argument reference for any widget is on its detail page,
            under “Arguments”.
          </p>
        </Section>

        <Section id="data" title="Widget data">
          <p>
            Your <Code>Widget</Code> function receives one props object. For a
            generic widget, that object contains only the template args you
            define. User and repo widgets receive those same args plus a
            reserved <Code>data</Code> prop.
          </p>
          <Snippet
            label="Runtime props"
            code={RUNTIME_PROPS_EXAMPLE}
            html={snippets.runtimeProps}
          />
          <p>
            The editor preview uses sample data, so selecting User or Repo in
            the Details tab only changes output once your source reads{" "}
            <Code>data.user</Code> or <Code>data.repo</Code>. Real embeds fill
            the same shape from the instance owner’s configured git token.
          </p>
          <Snippet
            label="Copyable local types"
            code={WIDGET_RUNTIME_TYPES}
            html={snippets.runtimeTypes}
          />
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

        <Section id="authoring" title="Authoring a widget">
          <p>
            A widget is a single React component named <Code>Widget</Code> that
            returns JSX styled with inline styles. It runs in a hardened sandbox
            - no imports, network, or filesystem - and is laid out to SVG with{" "}
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
            html={snippets.minimalWidget}
          />
          <p>
            Your component receives its resolved args as props. User and repo
            widgets also receive a <Code>data</Code> prop with normalized git
            data (<Code>data.user</Code> or <Code>data.repo</Code>). Open the{" "}
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
            .
          </p>
        </Section>

        <Section id="caching" title="Caching &amp; refresh">
          <p>
            Rendered images are cached aggressively and served with deliberate{" "}
            <Code>Cache-Control</Code> lifetimes, so READMEs stay fast while
            still refreshing. Editing a widget purges its cache immediately, so
            changes go live on the next request.
          </p>
          <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Image</th>
                  <th className="px-4 py-2 font-medium">Cache lifetime</th>
                  <th className="px-4 py-2 font-medium">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <CacheRow
                  what="Generic widget"
                  ttl="24 hours"
                  why="Deterministic from its params."
                />
                <CacheRow
                  what="User / repo instance"
                  ttl="1 hour"
                  why="Data-driven - refreshes hourly."
                />
                <CacheRow
                  what="Error / reconnect"
                  ttl="2 minutes"
                  why="Short, so it self-heals once fixed."
                />
                <CacheRow
                  what="Deleted (tombstone)"
                  ttl="5 minutes"
                  why="The widget or instance is gone."
                />
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            Every render returns HTTP 200 with a valid SVG (even errors) so a
            broken state degrades to a neat image instead of a broken{" "}
            <Code>{"<img>"}</Code>. The real condition travels in the{" "}
            <Code>X-Gita-Status</Code> header.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-4 leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}

function FieldTable({
  title,
  fields,
}: {
  title: string;
  fields: readonly (readonly [string, string, string])[];
}) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <div className="border-b bg-muted/40 px-4 py-2 text-sm font-medium">
        {title}
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Field</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Meaning</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {fields.map(([name, type, description]) => (
            <tr key={name}>
              <td className="px-4 py-2 font-mono text-xs">{name}</td>
              <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                {type}
              </td>
              <td className="px-4 py-2 text-muted-foreground">{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Snippet({
  label,
  code,
  html,
}: {
  label: string;
  code: string;
  html: string;
}) {
  return (
    <div className="source-view overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <CopyButton value={code} label="Copy" />
      </div>
      <div
        className="overflow-x-auto p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  );
}

function CacheRow({
  what,
  ttl,
  why,
}: {
  what: string;
  ttl: string;
  why: string;
}) {
  return (
    <tr>
      <td className="px-4 py-2 font-medium">{what}</td>
      <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
        {ttl}
      </td>
      <td className="px-4 py-2 text-muted-foreground">{why}</td>
    </tr>
  );
}
