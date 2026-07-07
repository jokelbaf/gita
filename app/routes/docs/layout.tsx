import { NavLink, Outlet } from "react-router";
import { PageTransition } from "~/components/layout/page-transition";
import { DOCS_NAV } from "~/lib/docs-nav";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/layout";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Docs - gita" },
    {
      name: "description",
      content:
        "Embed gita widgets in a README, configure template args, author your own, and drive gita from an AI with the REST API and MCP server.",
    },
  ];
}

export default function DocsLayout() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <aside className="mb-8 lg:mb-0">
          <nav className="flex flex-col gap-6 lg:sticky lg:top-20">
            {DOCS_NAV.map((group) => (
              <div key={group.group} className="space-y-1.5">
                <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {group.group}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          cn(
                            "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                            isActive
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                          )
                        }
                      >
                        {item.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="max-w-3xl min-w-0">
          <PageTransition>
            <div className="space-y-10">
              <Outlet />
            </div>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
