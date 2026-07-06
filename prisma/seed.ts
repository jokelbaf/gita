import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../app/generated/prisma/client";
import { encryptSecret, last4 } from "../app/services/crypto.server";

try {
  process.loadEnvFile();
} catch {
  // rely on ambient env
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set - cannot seed.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });

interface SeedUser {
  githubId: string;
  username: string;
  name: string;
}

const USERS: SeedUser[] = [
  { githubId: "583231", username: "octocat", name: "The Octocat" },
  { githubId: "1024025", username: "torvalds", name: "Linus Torvalds" },
  { githubId: "810438", username: "gaearon", name: "Dan Abramov" },
];

interface SeedArg {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "enum" | "color";
  default: string | number | boolean;
  required: boolean;
  description: string;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
}

interface SeedWidget {
  slug: string;
  name: string;
  description: string;
  authorUsername: string;
  likedBy: string[];
  argsSchema: SeedArg[];
  source: string;
}

const WIDGETS: SeedWidget[] = [
  {
    slug: "text-divider",
    name: "Text Divider",
    description: "A slim labelled divider for sectioning your README.",
    authorUsername: "octocat",
    likedBy: ["torvalds", "gaearon", "octocat"],
    argsSchema: [
      {
        name: "text",
        label: "Text",
        type: "string",
        default: "Section",
        required: true,
        description: "Label shown in the middle of the divider.",
        maxLength: 40,
      },
      {
        name: "color",
        label: "Color",
        type: "color",
        default: "#6366f1",
        required: false,
        description: "Line and label color.",
      },
      {
        name: "align",
        label: "Alignment",
        type: "enum",
        default: "center",
        required: false,
        description: "Where to place the label.",
        options: ["left", "center", "right"],
      },
    ],
    source: `function Widget({ text, color, align }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', color }}>
      <div style={{ flex: 1, height: 1, background: color, opacity: 0.4 }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: color, opacity: 0.4 }} />
    </div>
  );
}`,
  },
  {
    slug: "pill-badge",
    name: "Pill Badge",
    description: "A rounded label/value badge, shields.io style.",
    authorUsername: "gaearon",
    likedBy: ["octocat", "gaearon"],
    argsSchema: [
      {
        name: "label",
        label: "Label",
        type: "string",
        default: "build",
        required: true,
        description: "Left-hand label.",
        maxLength: 20,
      },
      {
        name: "value",
        label: "Value",
        type: "string",
        default: "passing",
        required: true,
        description: "Right-hand value.",
        maxLength: 20,
      },
      {
        name: "color",
        label: "Value color",
        type: "color",
        default: "#22c55e",
        required: false,
        description: "Background color of the value segment.",
      },
    ],
    source: `function Widget({ label, value, color }) {
  return (
    <div style={{ display: 'flex', fontSize: 13, fontFamily: 'sans-serif', borderRadius: 6, overflow: 'hidden' }}>
      <span style={{ background: '#333', color: '#fff', padding: '4px 8px' }}>{label}</span>
      <span style={{ background: color, color: '#fff', padding: '4px 8px' }}>{value}</span>
    </div>
  );
}`,
  },
  {
    slug: "quote-card",
    name: "Quote Card",
    description: "Show a favourite quote with attribution.",
    authorUsername: "torvalds",
    likedBy: ["gaearon"],
    argsSchema: [
      {
        name: "quote",
        label: "Quote",
        type: "string",
        default: "Talk is cheap. Show me the code.",
        required: true,
        description: "The quote text.",
        maxLength: 160,
      },
      {
        name: "author",
        label: "Author",
        type: "string",
        default: "Linus Torvalds",
        required: false,
        description: "Attribution shown under the quote.",
        maxLength: 40,
      },
      {
        name: "accent",
        label: "Accent",
        type: "color",
        default: "#8b5cf6",
        required: false,
        description: "Accent bar color.",
      },
    ],
    source: `function Widget({ quote, author, accent }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: 16, background: '#111', borderRadius: 10 }}>
      <div style={{ width: 4, background: accent, borderRadius: 2 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ color: '#eee', fontSize: 16, fontStyle: 'italic' }}>{quote}</span>
        {author ? <span style={{ color: '#888', fontSize: 13 }}>- {author}</span> : null}
      </div>
    </div>
  );
}`,
  },
  {
    slug: "stat-counter",
    name: "Stat Counter",
    description: "A single big-number stat tile.",
    authorUsername: "octocat",
    likedBy: ["torvalds", "octocat"],
    argsSchema: [
      {
        name: "label",
        label: "Label",
        type: "string",
        default: "Stars",
        required: true,
        description: "Caption under the number.",
        maxLength: 24,
      },
      {
        name: "value",
        label: "Value",
        type: "number",
        default: 1280,
        required: true,
        description: "The number to display.",
        min: 0,
        max: 1_000_000_000,
      },
      {
        name: "color",
        label: "Color",
        type: "color",
        default: "#f59e0b",
        required: false,
        description: "Number color.",
      },
    ],
    source: `function Widget({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16 }}>
      <span style={{ fontSize: 40, fontWeight: 800, color }}>{value}</span>
      <span style={{ fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
    </div>
  );
}`,
  },
  {
    slug: "tech-chip-row",
    name: "Tech Chip Row",
    description: "A wrapping row of technology chips.",
    authorUsername: "gaearon",
    likedBy: [],
    argsSchema: [
      {
        name: "items",
        label: "Items",
        type: "string",
        default: "TypeScript, React, Node",
        required: true,
        description: "Comma-separated list of technologies.",
        maxLength: 120,
      },
      {
        name: "color",
        label: "Chip color",
        type: "color",
        default: "#0ea5e9",
        required: false,
        description: "Chip background color.",
      },
    ],
    source: `function Widget({ items, color }) {
  const chips = String(items).split(',').map((s) => s.trim()).filter(Boolean);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {chips.map((chip) => (
        <span key={chip} style={{ background: color, color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: 13 }}>{chip}</span>
      ))}
    </div>
  );
}`,
  },
  {
    slug: "banner-header",
    name: "Banner Header",
    description: "A bold header banner with a title and subtitle.",
    authorUsername: "torvalds",
    likedBy: ["octocat", "gaearon", "torvalds"],
    argsSchema: [
      {
        name: "title",
        label: "Title",
        type: "string",
        default: "Hi, I'm Linus",
        required: true,
        description: "Main heading.",
        maxLength: 48,
      },
      {
        name: "subtitle",
        label: "Subtitle",
        type: "string",
        default: "I make kernels",
        required: false,
        description: "Secondary line.",
        maxLength: 64,
      },
      {
        name: "background",
        label: "Background",
        type: "color",
        default: "#0f172a",
        required: false,
        description: "Banner background color.",
      },
      {
        name: "foreground",
        label: "Text color",
        type: "color",
        default: "#f8fafc",
        required: false,
        description: "Banner text color.",
      },
    ],
    source: `function Widget({ title, subtitle, background, foreground }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 24, background, color: foreground, borderRadius: 12 }}>
      <span style={{ fontSize: 28, fontWeight: 800 }}>{title}</span>
      {subtitle ? <span style={{ fontSize: 16, opacity: 0.8 }}>{subtitle}</span> : null}
    </div>
  );
}`,
  },
];

const USER_WIDGET_SOURCE = `function Widget({ accent, data }) {
  const u = data.user.profile;
  const stats = [['followers', u.followers], ['following', u.following], ['repos', u.publicRepos]];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, width: '100%', background: '#0d1117', borderRadius: 12, color: '#e6edf3' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 22, fontWeight: 700 }}>{u.name || u.login}</span>
        <span style={{ fontSize: 14, color: '#8b949e' }}>@{u.login}</span>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        {stats.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: accent }}>{value}</span>
            <span style={{ fontSize: 12, color: '#8b949e' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`;

const REPO_WIDGET_SOURCE = `function Widget({ accent, data }) {
  const r = data.repo;
  const stats = [['stars', r.stats.stars], ['forks', r.stats.forks], ['watchers', r.stats.watchers]];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, width: '100%', background: '#0d1117', borderRadius: 12, color: '#e6edf3' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{r.meta.fullName}</span>
        {r.meta.description ? <span style={{ fontSize: 13, color: '#8b949e' }}>{r.meta.description}</span> : null}
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        {stats.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: accent }}>{value}</span>
            <span style={{ fontSize: 12, color: '#8b949e' }}>{label}</span>
          </div>
        ))}
        {r.primaryLanguage ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: accent }}>{r.primaryLanguage}</span>
            <span style={{ fontSize: 12, color: '#8b949e' }}>language</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}`;

const ACCENT_ARG: SeedArg[] = [
  {
    name: "accent",
    label: "Accent",
    type: "color",
    default: "#58a6ff",
    required: false,
    description: "Accent color for the stat numbers.",
  },
];

async function main() {
  const usersByName = new Map<string, string>();

  for (const user of USERS) {
    const record = await prisma.user.upsert({
      where: { username: user.username },
      update: { name: user.name, githubId: user.githubId },
      create: {
        username: user.username,
        githubId: user.githubId,
        name: user.name,
        email: `${user.username}@users.noreply.github.com`,
        emailVerified: true,
        avatarUrl: `https://github.com/${user.username}.png`,
        image: `https://github.com/${user.username}.png`,
      },
    });
    usersByName.set(user.username, record.id);
  }

  for (const widget of WIDGETS) {
    const authorId = usersByName.get(widget.authorUsername);
    if (!authorId) throw new Error(`Unknown author ${widget.authorUsername}`);

    const argsSchema = widget.argsSchema as unknown as Prisma.InputJsonValue;

    const record = await prisma.widget.upsert({
      where: { slug: widget.slug },
      update: {
        name: widget.name,
        description: widget.description,
        source: widget.source,
        argsSchema,
        visibility: "PUBLIC",
        type: "GENERIC",
        likesCount: widget.likedBy.length,
      },
      create: {
        slug: widget.slug,
        name: widget.name,
        description: widget.description,
        source: widget.source,
        argsSchema,
        type: "GENERIC",
        visibility: "PUBLIC",
        authorId,
        likesCount: widget.likedBy.length,
      },
    });

    for (const username of widget.likedBy) {
      const userId = usersByName.get(username);
      if (!userId) continue;
      await prisma.like.upsert({
        where: { userId_widgetId: { userId, widgetId: record.id } },
        update: {},
        create: { userId, widgetId: record.id },
      });
    }
  }

  const quoteOriginal = await prisma.widget.findUnique({
    where: { slug: "quote-card" },
    select: { id: true, name: true, source: true, argsSchema: true },
  });
  const gaearonForkId = usersByName.get("gaearon");
  if (quoteOriginal && gaearonForkId) {
    await prisma.widget.upsert({
      where: { slug: "quote-card-fork" },
      update: {
        forkedFromId: quoteOriginal.id,
        forkedFromName: quoteOriginal.name,
      },
      create: {
        slug: "quote-card-fork",
        name: "Quote Card (fork)",
        description:
          "A tweaked take on the quote card - my own accent defaults.",
        source: quoteOriginal.source,
        argsSchema: quoteOriginal.argsSchema as Prisma.InputJsonValue,
        type: "GENERIC",
        visibility: "PUBLIC",
        authorId: gaearonForkId,
        forkedFromId: quoteOriginal.id,
        forkedFromName: quoteOriginal.name,
      },
    });
  }

  const octocatId = usersByName.get("octocat");
  const torvaldsId = usersByName.get("torvalds");
  const gaearonId = usersByName.get("gaearon");
  if (!octocatId || !torvaldsId || !gaearonId) {
    throw new Error("Seed users missing - cannot seed data widgets.");
  }
  const accentArgs = ACCENT_ARG as unknown as Prisma.InputJsonValue;

  const userWidget = await prisma.widget.upsert({
    where: { slug: "github-profile-card" },
    update: { source: USER_WIDGET_SOURCE, argsSchema: accentArgs },
    create: {
      slug: "github-profile-card",
      name: "GitHub Profile Card",
      description: "Follower/following/repo stats for a GitHub user.",
      source: USER_WIDGET_SOURCE,
      argsSchema: accentArgs,
      type: "USER",
      visibility: "PUBLIC",
      authorId: torvaldsId,
    },
  });

  const repoWidget = await prisma.widget.upsert({
    where: { slug: "repo-stat-card" },
    update: { source: REPO_WIDGET_SOURCE, argsSchema: accentArgs },
    create: {
      slug: "repo-stat-card",
      name: "Repo Stat Card",
      description: "Stars, forks, watchers and language for a repository.",
      source: REPO_WIDGET_SOURCE,
      argsSchema: accentArgs,
      type: "REPO",
      visibility: "PUBLIC",
      authorId: gaearonId,
    },
  });

  await prisma.widgetInstance.upsert({
    where: { id: "seed-user-instance" },
    update: {},
    create: {
      id: "seed-user-instance",
      widgetId: userWidget.id,
      ownerId: octocatId,
      targetType: "USER",
      targetLogin: "torvalds",
      config: { accent: "#58a6ff" },
    },
  });
  await prisma.widgetInstance.upsert({
    where: { id: "seed-repo-instance" },
    update: {},
    create: {
      id: "seed-repo-instance",
      widgetId: repoWidget.id,
      ownerId: octocatId,
      targetType: "REPO",
      targetLogin: "facebook",
      targetRepo: "react",
      config: { accent: "#58a6ff" },
    },
  });

  const seedToken = process.env.SEED_GITHUB_TOKEN?.trim();
  if (seedToken) {
    await prisma.gitCredential.upsert({
      where: { userId: octocatId },
      update: {
        encryptedToken: encryptSecret(seedToken),
        last4: last4(seedToken),
        provider: "GITHUB",
        baseUrl: "https://github.com",
        invalidatedAt: null,
        validatedAt: new Date(),
      },
      create: {
        userId: octocatId,
        provider: "GITHUB",
        baseUrl: "https://github.com",
        encryptedToken: encryptSecret(seedToken),
        last4: last4(seedToken),
        scopes: [],
        accountLogin: "seed",
        validatedAt: new Date(),
      },
    });
  }

  const [userCount, widgetCount, likeCount, instanceCount, credentialCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.widget.count(),
      prisma.like.count(),
      prisma.widgetInstance.count(),
      prisma.gitCredential.count(),
    ]);
  console.log(
    `Seed complete: ${userCount} users, ${widgetCount} widgets, ${likeCount} likes, ` +
      `${instanceCount} instances, ${credentialCount} credentials.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
