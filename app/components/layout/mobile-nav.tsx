import { MenuIcon } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useOptionalUser } from "~/hooks/use-optional-user";
import { cn } from "~/lib/utils";
import { NAV_ITEMS } from "./nav";

export function MobileNav() {
  const user = useOptionalUser();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const items = NAV_ITEMS.filter((item) => user || !item.authOnly);
  const redirectTo = encodeURIComponent(location.pathname + location.search);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle asChild>
            <Link to="/" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {!user ? (
          <div className="mt-auto p-4">
            <Button asChild className="w-full" onClick={() => setOpen(false)}>
              <Link to={`/login?redirectTo=${redirectTo}`}>
                Sign in with GitHub
              </Link>
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
