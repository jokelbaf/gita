import {
  ClipboardCheckIcon,
  GaugeIcon,
  PaletteIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";
import { Reveal } from "~/components/reveal";
import { Button } from "~/components/ui/button";

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: SearchIcon,
    title: "Browse",
    body: "Find a widget in the community library - stats cards, badges, dividers, and more.",
  },
  {
    icon: SlidersHorizontalIcon,
    title: "Configure",
    body: "Fill in a short form to tune colors, text, and data. See a live preview instantly.",
  },
  {
    icon: ClipboardCheckIcon,
    title: "Paste",
    body: "Copy the generated Markdown into your README. It renders as an always-fresh image.",
  },
];

export function HowItWorks() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {STEPS.map((step, index) => (
        <Reveal key={step.title} delay={index * 90} className="h-full">
          <div className="group h-full rounded-xl border bg-card p-6 text-card-foreground transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
            <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <step.icon className="size-5" />
            </div>
            <h3 className="mb-1 font-semibold">
              <span className="text-muted-foreground">{index + 1}. </span>
              {step.title}
            </h3>
            <p className="text-sm text-muted-foreground">{step.body}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function Features() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
      <Reveal className="relative overflow-hidden rounded-2xl border bg-card p-6 transition-colors hover:border-primary/30 sm:col-span-2 lg:row-span-2">
        <div className="pointer-events-none absolute -top-10 -right-10 size-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex h-full flex-col">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheckIcon className="size-6" />
          </div>
          <h3 className="text-xl font-semibold">Sandboxed by default</h3>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Every widget runs in an isolated VM - no network, no filesystem, and
            hard memory and time limits. Untrusted code stays untrusted.
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-8">
            {["isolated-vm", "no network", "no filesystem", "hard limits"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border bg-background/60 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>
      </Reveal>

      <Reveal
        delay={80}
        className="rounded-2xl border bg-card p-5 transition-colors hover:border-primary/30"
      >
        <GaugeIcon className="mb-3 size-5 text-primary" />
        <h3 className="text-sm font-semibold">Fast & cached</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Renders are cached and served straight from the edge, so READMEs stay
          snappy.
        </p>
      </Reveal>

      <Reveal
        delay={160}
        className="rounded-2xl border bg-card p-5 transition-colors hover:border-primary/30"
      >
        <RefreshCwIcon className="mb-3 size-5 text-primary" />
        <h3 className="text-sm font-semibold">Always fresh</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Data-driven widgets refresh on their own schedule - no manual updates.
        </p>
      </Reveal>

      <Reveal
        delay={240}
        className="flex items-center gap-5 rounded-2xl border bg-card p-5 transition-colors hover:border-primary/30 sm:col-span-2"
      >
        <div className="min-w-0">
          <PaletteIcon className="mb-3 size-5 text-primary" />
          <h3 className="text-sm font-semibold">Light & dark ready</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Crisp SVGs that look right in every theme and at any resolution.
          </p>
        </div>
        <div className="ml-auto hidden shrink-0 items-center gap-2 sm:flex">
          <span className="size-14 rounded-xl border bg-white shadow-sm" />
          <span className="size-14 rounded-xl border border-white/10 bg-neutral-900 shadow-sm" />
        </div>
      </Reveal>
    </div>
  );
}

export function FinalCta({ isAuthed }: { isAuthed: boolean }) {
  return (
    <Reveal className="relative overflow-hidden rounded-3xl border bg-card px-6 py-14 text-center shadow-sm sm:px-12">
      <div className="pointer-events-none absolute inset-0 bg-hero-grid" />
      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5">
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Ship your first widget today
        </h2>
        <p className="text-balance text-muted-foreground">
          Browse the library or author your own React component - it renders to
          a crisp image the moment you paste the URL.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/widgets">Browse library</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={isAuthed ? "/widgets/new" : "/login"}>
              {isAuthed ? "Create a widget" : "Sign in with GitHub"}
            </Link>
          </Button>
        </div>
      </div>
    </Reveal>
  );
}
