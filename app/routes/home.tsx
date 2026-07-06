import { Link } from "react-router";
import { EditorShowcase } from "~/components/landing/editor-showcase";
import { HeroDemo } from "~/components/landing/hero-demo";
import { Features, FinalCta, HowItWorks } from "~/components/landing/sections";
import { Reveal } from "~/components/reveal";
import { Button } from "~/components/ui/button";
import { WidgetGrid } from "~/components/widgets/widget-grid";
import { useOptionalUser } from "~/hooks/use-optional-user";
import { userContext } from "~/services/context";
import { highlightSource } from "~/services/highlight.server";
import { getWidgetDetail, listWidgets } from "~/services/widgets.server";
import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  const title = "gita - widgets for GitHub READMEs";
  const description =
    "Create, configure, and embed dynamic, community-built widgets in any GitHub README.";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}

function showcaseSource(source: string): string {
  const lines = source.split("\n");
  return lines.length <= 26 ? source : lines.slice(0, 26).join("\n");
}

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userContext);
  const viewerId = user?.id ?? null;
  const { widgets } = await listWidgets({
    viewerId,
    publicOnly: true,
    sort: "trending",
    limit: 6,
  });

  let showcase: { slug: string; name: string; sourceHtml: string } | null =
    null;
  const featured = widgets[0];
  if (featured) {
    const detail = await getWidgetDetail(featured.slug, viewerId);
    if (detail) {
      showcase = {
        slug: detail.slug,
        name: detail.name,
        sourceHtml: await highlightSource(showcaseSource(detail.source)),
      };
    }
  }

  return { trending: widgets, showcase };
}

function SectionHeading({ title, body }: { title: string; body: string }) {
  return (
    <Reveal className="mb-8 max-w-2xl">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-2 text-muted-foreground">{body}</p>
    </Reveal>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { trending, showcase } = loaderData;
  const user = useOptionalUser();
  const demoItems = trending
    .slice(0, 4)
    .map((widget) => ({ slug: widget.slug, name: widget.name }));

  return (
    <div className="w-full">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-140 bg-hero-grid" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6 text-left">
            <span className="animate-in rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur duration-700 fill-mode-both fade-in slide-in-from-bottom-3">
              Community-built README widgets
            </span>
            <h1 className="animate-in text-4xl font-bold tracking-tight text-balance delay-100 duration-700 fill-mode-both fade-in slide-in-from-bottom-3 sm:text-5xl lg:text-6xl">
              Dynamic widgets for your GitHub README
            </h1>
            <p className="max-w-xl animate-in text-lg text-balance text-muted-foreground delay-200 duration-700 fill-mode-both fade-in slide-in-from-bottom-3">
              Author widgets as React components, publish them to a browsable
              library, and embed them anywhere with a single image URL.
            </p>
            <div className="flex animate-in flex-wrap items-center gap-3 delay-300 duration-700 fill-mode-both fade-in slide-in-from-bottom-3">
              <Button asChild size="lg">
                <Link to="/widgets">Browse library</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                {user ? (
                  <Link to="/widgets/new">Create a widget</Link>
                ) : (
                  <Link to="/login">Sign in with GitHub</Link>
                )}
              </Button>
            </div>
          </div>

          <div className="flex animate-in justify-center delay-200 duration-700 fill-mode-both zoom-in-95 fade-in lg:justify-end">
            <HeroDemo items={demoItems} />
          </div>
        </div>
      </section>

      {showcase ? (
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <SectionHeading
            title="Author widgets, not images"
            body="Write a React component with Tailwind. We run it in a hardened sandbox and render it to a crisp SVG on demand."
          />
          <Reveal delay={80}>
            <EditorShowcase {...showcase} />
          </Reveal>
        </section>
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <section className="pb-20">
          <SectionHeading
            title="How it works"
            body="From the library to your README in three steps."
          />
          <HowItWorks />
        </section>

        <section className="pb-20">
          <SectionHeading
            title="Built to be embedded"
            body="Safe to run, fast to serve, and beautiful in any README."
          />
          <Features />
        </section>

        {trending.length > 0 ? (
          <section className="pb-20">
            <div className="mb-6 flex items-end justify-between">
              <Reveal>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Trending now
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  The widgets the community is liking this week.
                </p>
              </Reveal>
              <Button asChild variant="ghost" size="sm">
                <Link to="/widgets?sort=trending">View all</Link>
              </Button>
            </div>
            <Reveal delay={80}>
              <WidgetGrid widgets={trending} />
            </Reveal>
          </section>
        ) : null}

        <section className="pb-24">
          <FinalCta isAuthed={Boolean(user)} />
        </section>
      </div>
    </div>
  );
}
