import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type { FieldErrors } from "~/services/widget-editor.server";
import type { Visibility, WidgetType } from "~/lib/widget";
import { typeDescription } from "~/lib/widget";

export interface WidgetMeta {
  name: string;
  description: string;
  type: WidgetType;
  visibility: Visibility;
}

const TYPE_ITEMS: { value: WidgetType; label: string }[] = [
  { value: "GENERIC", label: "Generic" },
  { value: "USER", label: "User" },
  { value: "REPO", label: "Repo" },
];

interface MetadataFieldsProps {
  meta: WidgetMeta;
  onChange: (patch: Partial<WidgetMeta>) => void;
  errors?: FieldErrors;
}

export function MetadataFields({
  meta,
  onChange,
  errors,
}: MetadataFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="widget-name">Name</Label>
        <Input
          id="widget-name"
          value={meta.name}
          maxLength={60}
          onChange={(e) => onChange({ name: e.target.value })}
          aria-invalid={Boolean(errors?.name)}
          placeholder="My widget"
        />
        {errors?.name ? (
          <p className="text-xs text-destructive">{errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="widget-description">Description</Label>
        <Textarea
          id="widget-description"
          value={meta.description}
          maxLength={280}
          rows={2}
          onChange={(e) => onChange({ description: e.target.value })}
          aria-invalid={Boolean(errors?.description)}
          placeholder="A short summary shown in the library."
        />
        {errors?.description ? (
          <p className="text-xs text-destructive">{errors.description}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="widget-type">Type</Label>
          <Select
            value={meta.type}
            onValueChange={(v) => onChange({ type: v as WidgetType })}
          >
            <SelectTrigger id="widget-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {typeDescription(meta.type)}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="widget-visibility">Visibility</Label>
          <Select
            value={meta.visibility}
            onValueChange={(v) => onChange({ visibility: v as Visibility })}
          >
            <SelectTrigger id="widget-visibility" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRIVATE">Private</SelectItem>
              <SelectItem value="PUBLIC">Public</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {meta.visibility === "PUBLIC"
              ? "Listed in the library for everyone."
              : "Only you can see it in the library."}
          </p>
        </div>
      </div>
    </div>
  );
}
