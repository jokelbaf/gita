import { useEffect, useState } from "react";
import { WidgetPreview } from "~/components/widgets/widget-preview";
import { widgetPreviewUrl } from "~/lib/widget";

interface HeroDemoItem {
  slug: string;
  name: string;
}

export function HeroDemo({ items }: { items: HeroDemoItem[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(
      () => setIndex((current) => (current + 1) % items.length),
      3500,
    );
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;
  const current = items[index % items.length];

  return (
    <div className="w-full max-w-md animate-widget-float">
      <div className="rounded-2xl border bg-card p-2 shadow-xl ring-1 ring-foreground/5">
        <WidgetPreview
          key={current.slug}
          src={widgetPreviewUrl(current.slug)}
          alt={`${current.name} preview`}
          className="min-h-56 animate-in rounded-xl duration-500 fade-in-0 zoom-in-95"
          padded
        />
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {items.map((item, i) => (
          <span
            key={item.slug}
            className={
              "size-1.5 rounded-full transition-colors " +
              (i === index % items.length
                ? "bg-primary"
                : "bg-muted-foreground/30")
            }
          />
        ))}
      </div>
    </div>
  );
}
