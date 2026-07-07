import { createHighlighter, type Highlighter } from "shiki";

let highlighterPromise: Promise<Highlighter> | null = null;
type HighlightLang = "tsx" | "markdown" | "bash" | "json";

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["tsx", "markdown", "bash", "json"],
    });
  }
  return highlighterPromise;
}

function escapeHtml(source: string): string {
  return source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function highlightCode(
  source: string,
  lang: HighlightLang = "tsx",
): Promise<string> {
  try {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(source, {
      lang,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: "light",
    });
  } catch {
    return `<pre class="shiki"><code>${escapeHtml(source)}</code></pre>`;
  }
}

/** Highlight widget source to theme-aware HTML. Falls back to escaped plain text. */
export async function highlightSource(source: string): Promise<string> {
  return highlightCode(source, "tsx");
}

/** Highlight a keyed map of snippets in one pass (used by the docs pages). */
export async function highlightSnippets<K extends string>(
  snippets: Record<K, { code: string; lang: HighlightLang }>,
): Promise<Record<K, string>> {
  const entries = await Promise.all(
    Object.entries(snippets).map(async ([key, snippet]) => {
      const { code, lang } = snippet as { code: string; lang: HighlightLang };
      return [key, await highlightCode(code, lang)] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<K, string>;
}
