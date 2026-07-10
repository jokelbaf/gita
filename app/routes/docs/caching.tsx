import { Code, DocsHeader, Section } from "~/components/docs/docs-ui";

interface Row {
  what: string;
  ttl: string;
  why: string;
}

const ROWS: Row[] = [
  {
    what: "Generic widget",
    ttl: "Revalidated",
    why: "Stored with an ETag, then validated so edits appear immediately.",
  },
  {
    what: "User / repo instance",
    ttl: "1 minute",
    why: "Short-lived render; provider data is cached separately.",
  },
  {
    what: "Error / reconnect",
    ttl: "2 minutes",
    why: "Short, so it self-heals once fixed.",
  },
  {
    what: "Deleted (tombstone)",
    ttl: "5 minutes",
    why: "The widget or instance is gone.",
  },
];

export default function DocsCaching() {
  return (
    <>
      <DocsHeader
        title="Caching & refresh"
        lead="Rendered images are cached aggressively with deliberate Cache-Control lifetimes."
      />

      <Section>
        <p>
          READMEs stay fast while still refreshing. Editing a widget (from the
          editor or the API) purges its cache immediately, so changes go live on
          the next request. Successful renders include an ETag, allowing
          browsers and proxies to validate unchanged images with a small 304
          response.
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
              {ROWS.map((row) => (
                <tr key={row.what}>
                  <td className="px-4 py-2 font-medium">{row.what}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-muted-foreground">
                    {row.ttl}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{row.why}</td>
                </tr>
              ))}
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
    </>
  );
}
