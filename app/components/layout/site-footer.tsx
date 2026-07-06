import { Link } from "react-router";
import { LogoMark } from "~/components/logo";

const FOOTER_LINKS = [
  { to: "/widgets", label: "Library" },
  { to: "/docs", label: "Docs" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LogoMark className="size-5" />
          <span>gita - dynamic widgets for GitHub READMEs</span>
        </div>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
