import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("widgets", "routes/widgets.tsx"),
  route("widgets/new", "routes/widget-new.tsx"),
  route("widgets/:slug", "routes/widget-detail.tsx"),
  route("widgets/:slug/edit", "routes/widget-edit.tsx"),
  route("widgets/:slug/fork", "routes/widget-fork.tsx"),
  route("u/:username", "routes/profile.tsx"),
  route("docs", "routes/docs.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("settings", "routes/settings.tsx"),
  route("login", "routes/login.tsx"),

  // Resource routes (no UI).
  route("logout", "routes/logout.tsx"),
  route("resource/set-theme", "routes/set-theme.tsx"),
  route("resource/like", "routes/like.tsx"),
  route("resource/instances", "routes/instances.tsx"),
  route("api/auth/*", "routes/auth-handler.tsx"),

  // Render pipeline. Image endpoints and editor preview.
  route("api/widget/public/:widgetId", "routes/widget-public.tsx"),
  route("api/widget/user/:instanceId", "routes/widget-user.tsx"),
  route("api/widget/repo/:instanceId", "routes/widget-repo.tsx"),
  route("api/preview", "routes/preview.tsx"),

  // Catch-all.
  route("*", "routes/catch-all.tsx"),
] satisfies RouteConfig;
