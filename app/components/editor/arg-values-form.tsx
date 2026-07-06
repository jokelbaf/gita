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
import type { ArgValue, ResolvedArgs, WidgetArg } from "~/services/args";

interface ArgValuesFormProps {
  schema: WidgetArg[];
  values: ResolvedArgs;
  onChange: (name: string, value: ArgValue) => void;
}

export function ArgValuesForm({
  schema,
  values,
  onChange,
}: ArgValuesFormProps) {
  if (schema.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        This widget takes no arguments. Add some in the Schema tab to configure
        the preview.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {schema.map((arg) => (
        <div key={arg.name} className="space-y-1.5">
          <Label htmlFor={`argval-${arg.name}`} className="text-xs">
            {arg.label || arg.name}
            {arg.required ? (
              <span className="text-destructive" aria-hidden>
                *
              </span>
            ) : null}
          </Label>
          <ArgControl arg={arg} value={values[arg.name]} onChange={onChange} />
        </div>
      ))}
    </div>
  );
}

function ArgControl({
  arg,
  value,
  onChange,
}: {
  arg: WidgetArg;
  value: ArgValue;
  onChange: (name: string, value: ArgValue) => void;
}) {
  const id = `argval-${arg.name}`;

  if (arg.type === "boolean") {
    return (
      <div className="flex h-8 items-center">
        <Switch
          id={id}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(arg.name, checked)}
        />
      </div>
    );
  }

  if (arg.type === "enum") {
    return (
      <Select
        value={String(value ?? "")}
        onValueChange={(v) => onChange(arg.name, v)}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select…" />
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
    const color = String(value ?? "");
    return (
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${arg.label} color picker`}
          value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#000000"}
          onChange={(e) => onChange(arg.name, e.target.value)}
          className="size-8 shrink-0 cursor-pointer rounded-md border border-input bg-transparent"
        />
        <Input
          id={id}
          value={color}
          onChange={(e) => onChange(arg.name, e.target.value)}
          className="font-mono text-xs"
        />
      </div>
    );
  }

  if (arg.type === "number") {
    return (
      <Input
        id={id}
        type="number"
        value={value === undefined ? "" : String(value)}
        min={arg.min}
        max={arg.max}
        onChange={(e) => onChange(arg.name, e.target.valueAsNumber || 0)}
      />
    );
  }

  return (
    <Input
      id={id}
      value={String(value ?? "")}
      maxLength={arg.maxLength}
      onChange={(e) => onChange(arg.name, e.target.value)}
    />
  );
}
