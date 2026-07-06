import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { WidgetArg } from "~/services/args";
import { ArgEditorRow } from "./arg-editor-row";
import { newArg } from "./arg-utils";

interface ArgsBuilderProps {
  schema: WidgetArg[];
  onChange: (next: WidgetArg[]) => void;
}

export function ArgsBuilder({ schema, onChange }: ArgsBuilderProps) {
  const nameCounts = schema.reduce<Record<string, number>>((acc, arg) => {
    acc[arg.name] = (acc[arg.name] ?? 0) + 1;
    return acc;
  }, {});

  function replaceAt(index: number, next: WidgetArg) {
    onChange(schema.map((arg, i) => (i === index ? next : arg)));
  }

  function removeAt(index: number) {
    onChange(schema.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= schema.length) return;
    const next = [...schema];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {schema.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          No arguments yet. Add one to make your widget configurable.
        </p>
      ) : (
        schema.map((arg, index) => (
          <ArgEditorRow
            key={index}
            arg={arg}
            index={index}
            count={schema.length}
            duplicate={nameCounts[arg.name] > 1}
            onChange={(next) => replaceAt(index, next)}
            onRemove={() => removeAt(index)}
            onMove={(direction) => move(index, direction)}
          />
        ))
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onChange([...schema, newArg(schema)])}
        disabled={schema.length >= 20}
      >
        <PlusIcon />
        Add argument
      </Button>
    </div>
  );
}
