export interface NavItem {
  to: string;
  label: string;
  /** Only shown to signed-in users. */
  authOnly?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/widgets", label: "Library" },
  { to: "/docs", label: "Docs" },
  { to: "/dashboard", label: "Dashboard", authOnly: true },
] as const;
