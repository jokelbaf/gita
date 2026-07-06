import { SparklesIcon } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useOptionalUser } from "~/hooks/use-optional-user";
import type { WidgetArg } from "~/services/args";
import type { WidgetType } from "~/lib/widget";
import type { InstanceCreateResult } from "~/routes/instances";
import { GenericUse } from "./generic-use";
import { InstanceEmbed } from "./instance-embed";
import { TargetPicker } from "./target-picker";

interface UseDialogProps {
  slug: string;
  name: string;
  type: WidgetType;
  argsSchema: WidgetArg[];
}

export function UseDialog(props: UseDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <SparklesIcon />
          Use
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle>Use “{props.name}”</DialogTitle>
          <DialogDescription>
            {props.type === "GENERIC"
              ? "Configure the widget and copy its URL or markdown into any README."
              : "Bind this widget to a git target, then embed the generated URL."}
          </DialogDescription>
        </DialogHeader>
        <UseFlow {...props} />
      </DialogContent>
    </Dialog>
  );
}

function UseFlow({ slug, name, type, argsSchema }: UseDialogProps) {
  const user = useOptionalUser();
  const createFetcher = useFetcher<InstanceCreateResult>();

  if (type === "GENERIC") {
    return <GenericUse slug={slug} name={name} argsSchema={argsSchema} />;
  }

  const result = createFetcher.data;
  if (result?.ok && result.id) {
    return (
      <InstanceEmbed
        instanceId={result.id}
        type={result.type ?? (type === "REPO" ? "REPO" : "USER")}
        name={name}
        target={result.target ?? ""}
      />
    );
  }

  return (
    <TargetPicker
      slug={slug}
      type={type === "REPO" ? "REPO" : "USER"}
      argsSchema={argsSchema}
      defaultLogin={user?.username ?? ""}
      createFetcher={createFetcher}
    />
  );
}
