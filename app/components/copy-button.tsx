import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface CopyButtonProps {
  value: string;
  /** Optional label; when omitted the button is icon-only. */
  label?: string;
  toastMessage?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-sm";
  className?: string;
}

export function CopyButton({
  value,
  label,
  toastMessage = "Copied to clipboard",
  variant = "outline",
  size = label ? "sm" : "icon-sm",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(toastMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn’t copy - copy it manually.");
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={copy}
      className={cn(className)}
      aria-label={label ?? "Copy"}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {label ? <span>{copied ? "Copied" : label}</span> : null}
    </Button>
  );
}
