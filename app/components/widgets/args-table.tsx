import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { WidgetArg } from "~/services/args";

function DefaultValue({ arg }: { arg: WidgetArg }) {
  if (arg.type === "color" && typeof arg.default === "string") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span
          className="size-3 rounded-full ring-1 ring-foreground/15"
          style={{ background: arg.default }}
        />
        <code className="text-xs">{arg.default}</code>
      </span>
    );
  }
  return <code className="text-xs">{String(arg.default)}</code>;
}

export function ArgsTable({ args }: { args: WidgetArg[] }) {
  if (args.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This widget takes no arguments.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Default</TableHead>
            <TableHead>Required</TableHead>
            <TableHead className="min-w-64">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {args.map((arg) => (
            <TableRow key={arg.name}>
              <TableCell className="font-mono text-xs font-medium">
                {arg.name}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{arg.type}</Badge>
              </TableCell>
              <TableCell>
                <DefaultValue arg={arg} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {arg.required ? "Yes" : "-"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {arg.description || "-"}
                {arg.type === "enum" && arg.options?.length ? (
                  <span className="mt-1 block text-xs">
                    Options: {arg.options.join(", ")}
                  </span>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
