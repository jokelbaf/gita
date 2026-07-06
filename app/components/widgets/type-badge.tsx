import {
  GitForkIcon,
  PackageIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { typeLabel, type WidgetType } from "~/lib/widget";

const ICONS: Record<WidgetType, LucideIcon> = {
  GENERIC: PackageIcon,
  USER: UserIcon,
  REPO: GitForkIcon,
};

export function TypeBadge({ type }: { type: WidgetType }) {
  const Icon = ICONS[type];
  return (
    <Badge variant="secondary" className="gap-1">
      <Icon />
      {typeLabel(type)}
    </Badge>
  );
}
