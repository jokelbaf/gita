import { redirect } from "react-router";
import {
  WidgetEditor,
  type WidgetEditorInitial,
} from "~/components/editor/widget-editor";
import { cloneTemplate } from "~/components/editor/starter-templates";
import { userContext } from "~/services/context";
import { requireUser } from "~/services/session.server";
import {
  createWidget,
  parseWidgetInput,
} from "~/services/widget-editor.server";
import type { Route } from "./+types/widget-new";

export function meta(_: Route.MetaArgs) {
  return [{ title: "New widget - gita" }];
}

const GENERIC_TEMPLATE = cloneTemplate("GENERIC");

const STARTER: WidgetEditorInitial = {
  name: "",
  description: "",
  type: GENERIC_TEMPLATE.type,
  visibility: "PRIVATE",
  source: GENERIC_TEMPLATE.source,
  argsSchema: GENERIC_TEMPLATE.argsSchema,
};

export async function loader({ request, context }: Route.LoaderArgs) {
  requireUser(context.get(userContext), request);
  return null;
}

export async function action({ request, context }: Route.ActionArgs) {
  const user = requireUser(context.get(userContext), request);
  const parsed = parseWidgetInput(await request.formData());
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  try {
    const slug = await createWidget(user.id, parsed.value);
    return redirect(`/widgets/${slug}`);
  } catch {
    return { formError: "Could not create the widget - please try again." };
  }
}

export default function NewWidget() {
  return <WidgetEditor mode="new" initial={STARTER} />;
}
