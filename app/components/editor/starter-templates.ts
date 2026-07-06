import type { WidgetType } from "~/lib/widget";
import type { WidgetArg } from "~/services/args";
import { WIDGET_RUNTIME_TYPES } from "~/services/widget-runtime";

export interface WidgetStarterTemplate {
  type: WidgetType;
  label: string;
  description: string;
  defaultName: string;
  defaultDescription: string;
  source: string;
  argsSchema: WidgetArg[];
}

const accentArg: WidgetArg = {
  name: "accent",
  label: "Accent",
  type: "color",
  default: "#38bdf8",
  required: false,
  description: "Accent color for key text and numbers.",
};

export const WIDGET_STARTER_TEMPLATES: Record<
  WidgetType,
  WidgetStarterTemplate
> = {
  GENERIC: {
    type: "GENERIC",
    label: "Generic",
    description: "A parameterized widget configured by query-string args.",
    defaultName: "README Card",
    defaultDescription: "A configurable README card.",
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
      accentArg,
    ],
  },
  USER: {
    type: "USER",
    label: "User",
    description: "A widget bound to a GitHub user instance.",
    defaultName: "GitHub User Card",
    defaultDescription: "A GitHub profile card powered by live user data.",
    source: `${WIDGET_RUNTIME_TYPES}

function Widget({ accent, data }: { accent: string; data: { user: GitUser } }) {
  const user = data.user;
  const stats = [
    ['followers', user.followers],
    ['following', user.following],
    ['repos', user.publicRepos],
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 20,
        width: '100%',
        background: '#0d1117',
        borderRadius: 12,
        color: '#e6edf3',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 22, fontWeight: 800 }}>
          {user.name || user.login}
        </span>
        <span style={{ fontSize: 14, color: '#8b949e' }}>@{user.login}</span>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        {stats.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: accent }}>
              {value}
            </span>
            <span style={{ fontSize: 12, color: '#8b949e' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    argsSchema: [accentArg],
  },
  REPO: {
    type: "REPO",
    label: "Repo",
    description: "A widget bound to a GitHub repository instance.",
    defaultName: "GitHub Repo Card",
    defaultDescription: "A GitHub repository card powered by live repo data.",
    source: `${WIDGET_RUNTIME_TYPES}

function Widget({ accent, data }: { accent: string; data: { repo: GitRepo } }) {
  const repo = data.repo;
  const stats = [
    ['stars', repo.stars],
    ['forks', repo.forks],
    ['issues', repo.openIssues],
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 20,
        width: '100%',
        background: '#0d1117',
        borderRadius: 12,
        color: '#e6edf3',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 18, fontWeight: 800 }}>{repo.fullName}</span>
        {repo.description ? (
          <span style={{ fontSize: 13, color: '#8b949e' }}>
            {repo.description}
          </span>
        ) : null}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {stats.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: accent }}>
              {value}
            </span>
            <span style={{ fontSize: 12, color: '#8b949e' }}>{label}</span>
          </div>
        ))}
        {repo.primaryLanguage ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: accent }}>
              {repo.primaryLanguage}
            </span>
            <span style={{ fontSize: 12, color: '#8b949e' }}>language</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}`,
    argsSchema: [accentArg],
  },
};

export function cloneTemplate(type: WidgetType): WidgetStarterTemplate {
  const template = WIDGET_STARTER_TEMPLATES[type];
  return {
    ...template,
    argsSchema: template.argsSchema.map((arg) => ({ ...arg })),
  };
}
