import { redirect } from "react-router";
import {
  WidgetEditor,
  type WidgetEditorInitial,
} from "~/components/editor/widget-editor";
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

const STARTER: WidgetEditorInitial = {
  name: "",
  description: "",
  type: "GENERIC",
  visibility: "PRIVATE",
  source: `function Widget({ title, subtitle, background, accent }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 24,
        width: '100%',
        background,
        borderRadius: 14,
        fontFamily: 'sans-serif',
      }}
    >
      <span style={{ fontSize: 26, fontWeight: 800, color: accent }}>
        {title}
      </span>
      <span style={{ fontSize: 15, color: '#94a3b8' }}>{subtitle}</span>
    </div>
  );
}`,
  argsSchema: [
    {
      name: "title",
      label: "Title",
      type: "string",
      default: "Hello, README",
      required: true,
      description: "The main heading.",
      maxLength: 60,
    },
    {
      name: "subtitle",
      label: "Subtitle",
      type: "string",
      default: "Built with gita",
      required: false,
      description: "Secondary line under the title.",
      maxLength: 80,
    },
    {
      name: "background",
      label: "Background",
      type: "color",
      default: "#0f172a",
      required: false,
      description: "Card background color.",
    },
    {
      name: "accent",
      label: "Accent",
      type: "color",
      default: "#38bdf8",
      required: false,
      description: "Title color.",
    },
  ],
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
