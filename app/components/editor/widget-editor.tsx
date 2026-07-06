import { Loader2Icon, SaveIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useActionData,
  useNavigation,
  useSubmit,
  type Blocker,
} from "react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useTheme } from "~/hooks/use-theme";
import type { ArgValue, ResolvedArgs, WidgetArg } from "~/services/args";
import type { FieldErrors } from "~/services/widget-editor.server";
import { ArgsBuilder } from "./args-builder";
import { ArgValuesForm } from "./arg-values-form";
import { CodeEditor } from "./code-editor";
import { MetadataFields, type WidgetMeta } from "./metadata-fields";
import { PreviewPane } from "./preview-pane";
import { useUnsavedChanges } from "./use-unsaved-changes";
import { useWidgetPreview } from "./use-widget-preview";

export interface WidgetEditorInitial extends WidgetMeta {
  source: string;
  argsSchema: WidgetArg[];
}

interface WidgetEditorProps {
  mode: "new" | "edit";
  initial: WidgetEditorInitial;
  slug?: string;
}

interface EditorActionData {
  fieldErrors?: FieldErrors;
  formError?: string;
}

export function WidgetEditor({ mode, initial, slug }: WidgetEditorProps) {
  const { theme } = useTheme();
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData() as EditorActionData | undefined;

  const [source, setSource] = useState(initial.source);
  const [argsSchema, setArgsSchema] = useState<WidgetArg[]>(initial.argsSchema);
  const [meta, setMeta] = useState<WidgetMeta>({
    name: initial.name,
    description: initial.description,
    type: initial.type,
    visibility: initial.visibility,
  });
  const [overrides, setOverrides] = useState<Record<string, ArgValue>>({});

  const saving = navigation.state !== "idle";
  const bypass = useRef(false);

  useEffect(() => {
    if (actionData?.fieldErrors) bypass.current = false;
  }, [actionData]);

  const initialSnapshot = useMemo(
    () =>
      JSON.stringify({
        source: initial.source,
        argsSchema: initial.argsSchema,
        meta: {
          name: initial.name,
          description: initial.description,
          type: initial.type,
          visibility: initial.visibility,
        },
      }),
    [initial],
  );
  const dirty =
    JSON.stringify({ source, argsSchema, meta }) !== initialSnapshot;
  const blocker = useUnsavedChanges(dirty, bypass);

  const previewArgs = useMemo<ResolvedArgs>(() => {
    const values: ResolvedArgs = {};
    for (const arg of argsSchema)
      values[arg.name] = overrides[arg.name] ?? arg.default;
    return values;
  }, [argsSchema, overrides]);

  const preview = useWidgetPreview({
    source,
    argsSchema,
    args: previewArgs,
    type: meta.type,
  });

  function handleSave() {
    bypass.current = true;
    const fd = new FormData();
    fd.set("name", meta.name);
    fd.set("description", meta.description);
    fd.set("type", meta.type);
    fd.set("visibility", meta.visibility);
    fd.set("source", source);
    fd.set("argsSchema", JSON.stringify(argsSchema));
    submit(fd, { method: "post" });
  }

  const cancelHref = mode === "edit" && slug ? `/widgets/${slug}` : "/widgets";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {mode === "new" ? "New widget" : "Edit widget"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "new"
              ? "Write a component, define its arguments, and preview exactly what ships."
              : "Changes purge the render cache so embedded images update."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to={cancelHref}>Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            {mode === "new" ? "Create widget" : "Save changes"}
          </Button>
        </div>
      </header>

      {actionData?.formError ? (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {actionData.formError}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="flex h-[68vh] min-h-96 flex-col overflow-hidden rounded-xl ring-1 ring-foreground/10">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              Widget.tsx
            </span>
            <span className="text-xs text-muted-foreground">
              {dirty ? "Unsaved changes" : "Saved"}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-card">
            <CodeEditor value={source} onChange={setSource} theme={theme} />
          </div>
        </div>

        <div className="flex h-[68vh] min-h-96 flex-col gap-4">
          <div className="widget-canvas flex-1 overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <PreviewPane state={preview} />
          </div>

          <Tabs
            defaultValue="configure"
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="w-full">
              <TabsTrigger value="configure">Configure</TabsTrigger>
              <TabsTrigger value="schema">Arguments</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border p-4">
              <TabsContent value="configure">
                <ArgValuesForm
                  schema={argsSchema}
                  values={previewArgs}
                  onChange={(name, value) =>
                    setOverrides((prev) => ({ ...prev, [name]: value }))
                  }
                />
              </TabsContent>
              <TabsContent value="schema">
                <ArgsBuilder schema={argsSchema} onChange={setArgsSchema} />
              </TabsContent>
              <TabsContent value="details">
                <MetadataFields
                  meta={meta}
                  onChange={(patch) =>
                    setMeta((prev) => ({ ...prev, ...patch }))
                  }
                  errors={actionData?.fieldErrors}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <UnsavedDialog blocker={blocker} />
    </div>
  );
}

function UnsavedDialog({ blocker }: { blocker: Blocker }) {
  const blocked = blocker.state === "blocked";
  return (
    <AlertDialog
      open={blocked}
      onOpenChange={(open) => {
        if (!open) blocker.reset?.();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have edits that haven’t been saved. If you leave now they’ll be
            lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => blocker.reset?.()}>
            Keep editing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => blocker.proceed?.()}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
