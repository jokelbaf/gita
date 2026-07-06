import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Font } from "satori";

const FONT_DIR = join(process.cwd(), "app", "assets", "fonts");

let fonts: Font[] | null = null;

export function getFonts(): Font[] {
  if (fonts) return fonts;
  fonts = [
    {
      name: "Inter",
      weight: 400,
      style: "normal",
      data: readFileSync(join(FONT_DIR, "Inter-Regular.ttf")),
    },
    {
      name: "Inter",
      weight: 600,
      style: "normal",
      data: readFileSync(join(FONT_DIR, "Inter-SemiBold.ttf")),
    },
    {
      name: "Inter",
      weight: 700,
      style: "normal",
      data: readFileSync(join(FONT_DIR, "Inter-Bold.ttf")),
    },
  ];
  return fonts;
}
