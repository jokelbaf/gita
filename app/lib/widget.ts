import type { Visibility, WidgetType } from "~/generated/prisma/enums";

export type { WidgetType, Visibility };

export type SortKey = "popular" | "trending" | "newest";
export type TypeFilter = "all" | WidgetType;

export interface WidgetCard {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: WidgetType;
  visibility: Visibility;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  author: { username: string; name: string; avatarUrl: string | null };
  isFork: boolean;
  forkedFromName: string | null;
  /** Slug of the original, only when it still exists and is publicly linkable. */
  forkedFromSlug: string | null;
  likedByViewer: boolean;
  isOwner: boolean;
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
];

export const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "GENERIC", label: "Generic" },
  { value: "USER", label: "User" },
  { value: "REPO", label: "Repo" },
];

const TYPE_META: Record<WidgetType, { label: string; description: string }> = {
  GENERIC: {
    label: "Generic",
    description: "Parameterized via query string - one URL, many consumers.",
  },
  USER: {
    label: "User",
    description: "Bound to a GitHub user; renders their live profile data.",
  },
  REPO: {
    label: "Repo",
    description: "Bound to a repository; renders its live stats.",
  },
};

export function typeLabel(type: WidgetType): string {
  return TYPE_META[type].label;
}

export function typeDescription(type: WidgetType): string {
  return TYPE_META[type].description;
}

export function widgetPreviewUrl(
  slug: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const base = `/api/widget/public/${encodeURIComponent(slug)}`;
  if (!params) return base;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

export function widgetMarkdown(name: string, url: string): string {
  return `![${name}](${url})`;
}
