import type { ReactNode } from "react";
import satori from "satori";
import { getFonts } from "./fonts.server";

interface CardOptions {
  accent: string;
  title: string;
  detail: string;
}

function cardTree({ accent, title, detail }: CardOptions): ReactNode {
  const node = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        padding: 20,
        gap: 10,
        background: "#0b1120",
        border: "1px solid #1e293b",
        borderRadius: 12,
        fontFamily: "Inter",
        color: "#e2e8f0",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center", gap: 10 },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    background: accent,
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: { display: "flex", fontSize: 16, fontWeight: 600 },
                  children: title,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", fontSize: 13, color: "#94a3b8" },
            children: detail,
          },
        },
      ],
    },
  };
  return node as unknown as ReactNode;
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (c) =>
    c === "<"
      ? "&lt;"
      : c === ">"
        ? "&gt;"
        : c === "&"
          ? "&amp;"
          : c === '"'
            ? "&quot;"
            : "&apos;",
  );
}

function fallbackSvg({ accent, title, detail }: CardOptions): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="84" viewBox="0 0 440 84"><rect width="440" height="84" rx="12" fill="#0b1120" stroke="#1e293b"/><circle cx="26" cy="34" r="6" fill="${accent}"/><text x="42" y="39" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="600">${escapeXml(title)}</text><text x="20" y="64" fill="#94a3b8" font-family="sans-serif" font-size="13">${escapeXml(detail)}</text></svg>`;
}

async function renderCard(opts: CardOptions): Promise<string> {
  try {
    return await satori(cardTree(opts), { width: 440, fonts: getFonts() });
  } catch {
    return fallbackSvg(opts);
  }
}

export function errorImage(detail?: string): Promise<string> {
  return renderCard({
    accent: "#f43f5e",
    title: "Widget failed to render",
    detail: detail ?? "The widget could not be rendered.",
  });
}

let tombstone: Promise<string> | null = null;
export function tombstoneImage(): Promise<string> {
  tombstone ??= renderCard({
    accent: "#64748b",
    title: "This widget no longer exists",
    detail: "The widget or instance behind this URL was deleted.",
  });
  return tombstone;
}

let reconnect: Promise<string> | null = null;
export function reconnectImage(): Promise<string> {
  reconnect ??= renderCard({
    accent: "#f59e0b",
    title: "Connect a git token",
    detail: "This widget's owner needs to reconnect their git access token.",
  });
  return reconnect;
}
