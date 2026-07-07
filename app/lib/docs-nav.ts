export interface DocsNavItem {
  to: string;
  title: string;
  /** Whether NavLink should match this path exactly (the index route). */
  end?: boolean;
}

export interface DocsNavGroup {
  group: string;
  items: DocsNavItem[];
}

export const DOCS_NAV: DocsNavGroup[] = [
  {
    group: "Guides",
    items: [
      { to: "/docs", title: "Overview", end: true },
      { to: "/docs/embedding", title: "Embedding" },
      { to: "/docs/arguments", title: "Template args" },
      { to: "/docs/data", title: "Widget data" },
      { to: "/docs/authoring", title: "Authoring widgets" },
      { to: "/docs/caching", title: "Caching & refresh" },
    ],
  },
  {
    group: "Automation",
    items: [
      { to: "/docs/api", title: "REST API" },
      { to: "/docs/mcp", title: "AI & MCP" },
    ],
  },
];
