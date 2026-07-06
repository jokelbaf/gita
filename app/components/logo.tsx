import { cn } from "~/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7 text-primary", className)}
      role="img"
      aria-label="Gita"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <rect
        x="6.5"
        y="6.5"
        width="12"
        height="12"
        rx="3"
        fill="var(--primary-foreground)"
      />
      <circle cx="21.5" cy="21.5" r="4" fill="var(--primary-foreground)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-semibold", className)}>
      <LogoMark />
      <span className="text-lg tracking-tight">gita</span>
    </span>
  );
}
