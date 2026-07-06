import { ImageOffIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface WidgetPreviewProps {
  src: string;
  alt: string;
  className?: string;
  padded?: boolean;
}

export function WidgetPreview({
  src,
  alt,
  className,
  padded,
}: WidgetPreviewProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // An SSR-rendered or HTTP-cached <img> is frequently already complete before
  // React attaches the onLoad handler, so the event never fires and the preview
  // stays hidden. Resolve the state from the element itself as soon as it mounts.
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (!node) return;
    if (node.complete) {
      if (node.naturalWidth > 0) setLoaded(true);
      else setErrored(true);
    }
  }, []);

  return (
    <div
      className={cn(
        "widget-canvas relative flex items-center justify-center overflow-hidden",
        padded ? "p-8" : "p-4",
        className,
      )}
    >
      {!loaded && !errored ? (
        <Skeleton className="absolute inset-3 rounded-md" />
      ) : null}

      {errored ? (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageOffIcon className="size-6" />
          <span className="text-xs">Preview unavailable</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={cn(
            "max-h-full max-w-full object-contain transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
