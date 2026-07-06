import { ChevronDownIcon, ChevronUpIcon, Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import type { ArgType, WidgetArg } from "~/services/args";
import { ARG_TYPE_OPTIONS, defaultForType, retypeArg } from "./arg-utils";

interface ArgEditorRowProps {
  arg: WidgetArg;
  index: number;
  count: number;
  duplicate: boolean;
  onChange: (next: WidgetArg) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}

export function ArgEditorRow({
  arg,
  index,
  count,
  duplicate,
  onChange,
  onRemove,
  onMove,
}: ArgEditorRowProps) {
  const patch = (part: Partial<WidgetArg>) => onChange({ ...arg, ...part });

  return (
    <div className="space-y-3 rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        <Input
          aria-label="Argument name"
          value={arg.name}
          onChange={(e) => patch({ name: e.target.value })}
          aria-invalid={duplicate || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(arg.name)}
          className="h-7 flex-1 font-mono text-xs"
          placeholder="argName"
        />
        <Select
          value={arg.type}
          onValueChange={(v) => onChange(retypeArg(arg, v as ArgType))}
        >
          <SelectTrigger size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ARG_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label="Move up"
          >
            <ChevronUpIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={index === count - 1}
            onClick={() => onMove(1)}
            aria-label="Move down"
          >
            <ChevronDownIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            aria-label="Remove argument"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>

      {duplicate ? (
        <p className="text-xs text-destructive">
          Another argument already uses this name.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label">
          <Input
            value={arg.label}
            onChange={(e) => patch({ label: e.target.value })}
            className="h-7 text-xs"
          />
        </Field>
        <Field label="Default">
          <DefaultControl arg={arg} onChange={onChange} />
        </Field>

        {arg.type === "enum" ? (
          <Field label="Options (comma-separated)" full>
            <Input
              value={(arg.options ?? []).join(", ")}
              onChange={(e) => {
                const options = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                const stillValid = options.includes(String(arg.default));
                onChange({
                  ...arg,
                  options,
                  default: stillValid ? arg.default : (options[0] ?? ""),
                });
              }}
              className="h-7 text-xs"
              placeholder="one, two, three"
            />
          </Field>
        ) : null}

        {arg.type === "string" ? (
          <Field label="Max length">
            <Input
              type="number"
              value={arg.maxLength ?? ""}
              min={1}
              onChange={(e) =>
                patch({
                  maxLength: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              className="h-7 text-xs"
            />
          </Field>
        ) : null}

        {arg.type === "number" ? (
          <>
            <Field label="Min">
              <Input
                type="number"
                value={arg.min ?? ""}
                onChange={(e) =>
                  patch({
                    min: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="h-7 text-xs"
              />
            </Field>
            <Field label="Max">
              <Input
                type="number"
                value={arg.max ?? ""}
                onChange={(e) =>
                  patch({
                    max: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="h-7 text-xs"
              />
            </Field>
          </>
        ) : null}

        <Field label="Description" full>
          <Input
            value={arg.description}
            onChange={(e) => patch({ description: e.target.value })}
            className="h-7 text-xs"
            placeholder="What this argument does"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <Switch
          size="sm"
          checked={arg.required}
          onCheckedChange={(checked) => patch({ required: checked })}
        />
        Required (form-level - renders still fall back to the default)
      </label>
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "space-y-1 sm:col-span-2" : "space-y-1"}>
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function DefaultControl({
  arg,
  onChange,
}: {
  arg: WidgetArg;
  onChange: (next: WidgetArg) => void;
}) {
  if (arg.type === "boolean") {
    return (
      <div className="flex h-7 items-center">
        <Switch
          size="sm"
          checked={Boolean(arg.default)}
          onCheckedChange={(checked) => onChange({ ...arg, default: checked })}
        />
      </div>
    );
  }

  if (arg.type === "enum") {
    return (
      <Select
        value={String(arg.default ?? "")}
        onValueChange={(v) => onChange({ ...arg, default: v })}
      >
        <SelectTrigger size="sm" className="w-full">
          <SelectValue placeholder="Default" />
        </SelectTrigger>
        <SelectContent>
          {(arg.options ?? []).map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (arg.type === "color") {
    const color = String(arg.default ?? "");
    return (
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          aria-label="Default color"
          value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#000000"}
          onChange={(e) => onChange({ ...arg, default: e.target.value })}
          className="size-7 shrink-0 cursor-pointer rounded-md border border-input bg-transparent"
        />
        <Input
          value={color}
          onChange={(e) => onChange({ ...arg, default: e.target.value })}
          className="h-7 font-mono text-xs"
        />
      </div>
    );
  }

  if (arg.type === "number") {
    return (
      <Input
        type="number"
        value={arg.default === undefined ? "" : String(arg.default)}
        onChange={(e) =>
          onChange({ ...arg, default: e.target.valueAsNumber || 0 })
        }
        className="h-7 text-xs"
      />
    );
  }

  return (
    <Input
      value={String(arg.default ?? "")}
      onChange={(e) => onChange({ ...arg, default: e.target.value })}
      className="h-7 text-xs"
      placeholder={String(defaultForType("string"))}
    />
  );
}
