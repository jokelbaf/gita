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
  { id: "authoring", label: "Authoring", icon: CodeIcon },
  { id: "caching", label: "Caching", icon: ClockIcon },
] as const;

export default function Docs() {
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
          <Snippet label="Generic widget">
            {`![Pill Badge](https://gita.jokelbaf.dev/api/widget/public/pill-badge?label=build&value=passing)`}
          </Snippet>
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
          <Snippet label="Overriding args on a generic widget">
            {`![Stat](https://gita.jokelbaf.dev/api/widget/public/stat-counter?label=Stars&value=1280&color=%23f59e0b)`}
          </Snippet>
          <p className="text-sm text-muted-foreground">
            The full argument reference for any widget is on its detail page,
            under “Arguments”.
          </p>
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
          <Snippet label="A minimal widget">
            {`function Widget({ label, color }) {
  return (
    <div style={{ display: 'flex', padding: 16, color }}>
      {label}
    </div>
  );
}`}
          </Snippet>
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

function Snippet({ label, children }: { label: string; children: string }) {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <CopyButton value={children} label="Copy" />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
        {children}
      </pre>
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
