import { redirect } from "react-router";
import { WidgetEditor } from "~/components/editor/widget-editor";
import { userContext } from "~/services/context";
import { toErrorResponse } from "~/services/errors";
import { requireUser } from "~/services/session.server";
import {
  getEditableWidget,
  parseWidgetInput,
  updateWidget,
} from "~/services/widget-editor.server";
import type { Route } from "./+types/widget-edit";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `Edit ${loaderData?.widget.name ?? "widget"} - gita` }];
}

export async function loader({ params, request, context }: Route.LoaderArgs) {
  const user = requireUser(context.get(userContext), request);
  try {
    const widget = await getEditableWidget(params.slug, user.id);
    return { widget };
  } catch (error) {
    throw toErrorResponse(error);
  }
}

export async function action({ params, request, context }: Route.ActionArgs) {
  const user = requireUser(context.get(userContext), request);
  const parsed = parseWidgetInput(await request.formData());
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  try {
    const slug = await updateWidget(params.slug, user.id, parsed.value);
    return redirect(`/widgets/${slug}`);
  } catch (error) {
    throw toErrorResponse(error);
  }
}

export default function EditWidget({ loaderData }: Route.ComponentProps) {
  const { widget } = loaderData;
  return <WidgetEditor mode="edit" slug={widget.slug} initial={widget} />;
}
