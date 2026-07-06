import * as linguistLanguages from "linguist-languages";
import type { Language } from "linguist-languages";

const LANGUAGE_COLORS = new Map<string, string>();
for (const language of Object.values(linguistLanguages) as Language[]) {
  if (language.color) LANGUAGE_COLORS.set(language.name, language.color);
}

export function languageColor(name: string): string | null {
  return LANGUAGE_COLORS.get(name) ?? null;
}
