import type { ReactNode } from "react";
import satori from "satori";
import { RenderError } from "../errors";
import { renderLog } from "../logger.server";
import {
  runWidget,
  SandboxError,
  type SandboxFailure,
} from "../sandbox/index.server";
import { getFonts } from "./fonts.server";
import { errorImage } from "./images.server";

export { errorImage, reconnectImage, tombstoneImage } from "./images.server";

const DEFAULT_WIDTH = 500;
const MIN_WIDTH = 32;
const MAX_WIDTH = 1200;
const MIN_HEIGHT = 16;
const MAX_HEIGHT = 800;

export interface RenderInput {
  source: string;
  // Widget props: resolved arg values plus, for instances, a nested `data` object.
  args: Record<string, unknown>;
  width?: number;
  height?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export async function renderWidgetSvg(input: RenderInput): Promise<string> {
  const node = await runWidget(input.source, input.args);
  const width = clamp(input.width ?? DEFAULT_WIDTH, MIN_WIDTH, MAX_WIDTH);
  const height =
    input.height !== undefined
      ? clamp(input.height, MIN_HEIGHT, MAX_HEIGHT)
      : undefined;
  try {
    return await satori(node as unknown as ReactNode, {
      width,
      ...(height !== undefined ? { height } : {}),
      fonts: getFonts(),
    });
  } catch (error) {
    throw new RenderError(
      error instanceof Error ? error.message : "Failed to lay out the widget.",
    );
  }
}

export interface RenderOutcome {
  svg: string;
  ok: boolean;
  failure?: SandboxFailure | "render";
  message?: string;
}

/**
 * Render a widget and, on any failure, resolve to a neatly designed error image.
 */
export async function renderWidgetOutcome(
  input: RenderInput,
): Promise<RenderOutcome> {
  try {
    return { svg: await renderWidgetSvg(input), ok: true };
  } catch (error) {
    const failure = error instanceof SandboxError ? error.failure : "render";
    const message =
      error instanceof Error
        ? error.message
        : "The widget could not be rendered.";
    renderLog.warn({ failure, msg: message }, "render failed > error image");
    return { svg: await errorImage(message), ok: false, failure, message };
  }
}
