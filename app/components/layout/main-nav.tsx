import { NavLink } from "react-router";
import { cn } from "~/lib/utils";
import { NAV_ITEMS } from "./nav";

export function MainNav({ showAuthOnly }: { showAuthOnly: boolean }) {
  const items = NAV_ITEMS.filter((item) => showAuthOnly || !item.authOnly);

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
