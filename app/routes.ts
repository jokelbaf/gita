import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("widgets", "routes/widgets.tsx"),
  route("widgets/new", "routes/widget-new.tsx"),
  route("widgets/:slug", "routes/widget-detail.tsx"),
  route("widgets/:slug/edit", "routes/widget-edit.tsx"),
  route("widgets/:slug/fork", "routes/widget-fork.tsx"),
  route("u/:username", "routes/profile.tsx"),
  route("docs", "routes/docs/layout.tsx", [
    index("routes/docs/overview.tsx"),
    route("embedding", "routes/docs/embedding.tsx"),
    route("arguments", "routes/docs/arguments.tsx"),
    route("data", "routes/docs/data.tsx"),
    route("authoring", "routes/docs/authoring.tsx"),
    route("caching", "routes/docs/caching.tsx"),
    route("api", "routes/docs/api.tsx"),
    route("mcp", "routes/docs/mcp.tsx"),
  ]),
  route("dashboard", "routes/dashboard.tsx"),
  route("settings", "routes/settings.tsx"),
  route("login", "routes/login.tsx"),

  // Resource routes (no UI).
  route("logout", "routes/logout.tsx"),
  route("resource/set-theme", "routes/set-theme.tsx"),
  route("resource/like", "routes/like.tsx"),
  route("resource/instances", "routes/instances.tsx"),
  route("resource/api-keys", "routes/api-keys.tsx"),
  route("api/auth/*", "routes/auth-handler.tsx"),

  // Render pipeline. Image endpoints and editor preview.
  route("api/widget/public/:widgetId", "routes/widget-public.tsx"),
  route("api/widget/user/:instanceId", "routes/widget-user.tsx"),
  route("api/widget/repo/:instanceId", "routes/widget-repo.tsx"),
  route("api/preview", "routes/preview.tsx"),

  // Programmatic surface. REST API + MCP server, authed by personal API keys.
  route("api/mcp", "routes/api-mcp.tsx"),
  route("api/v1/me", "routes/api-v1-me.tsx"),
  route("api/v1/widgets", "routes/api-v1-widgets.tsx"),
  route("api/v1/widgets/:slug", "routes/api-v1-widget.tsx"),
  route("api/v1/widgets/:slug/fork", "routes/api-v1-widget-fork.tsx"),
  route(
    "api/v1/widgets/:slug/visibility",
    "routes/api-v1-widget-visibility.tsx",
  ),
  route("api/v1/instances", "routes/api-v1-instances.tsx"),
  route("api/v1/instances/:id", "routes/api-v1-instance.tsx"),

  // Catch-all.
  route("*", "routes/catch-all.tsx"),
] satisfies RouteConfig;
