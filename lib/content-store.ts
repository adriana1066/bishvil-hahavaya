import { env } from "cloudflare:workers";
import { defaultSiteContent, type SiteContent } from "./site-content";

const schema = `CREATE TABLE IF NOT EXISTS site_content (id TEXT PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT NOT NULL)`;

export async function getSiteContent(): Promise<SiteContent> {
  try {
    await env.DB.prepare(schema).run();
    const row = await env.DB.prepare("SELECT content FROM site_content WHERE id = ?").bind("main").first<{content:string}>();
    if (!row) return defaultSiteContent;
    const saved = JSON.parse(row.content) as Partial<SiteContent>;
    const merged = {...defaultSiteContent, ...saved,
      site:{...defaultSiteContent.site,...saved.site,navigation:saved.site?.navigation??defaultSiteContent.site.navigation},
      opening:{...defaultSiteContent.opening,...saved.opening},
      story:{...defaultSiteContent.story,...saved.story},
      welcome:{...defaultSiteContent.welcome,...saved.welcome},
      host:{...defaultSiteContent.host,...saved.host,comparison:saved.host?.comparison??defaultSiteContent.host.comparison},
      service:{...defaultSiteContent.service,...saved.service},
      food:{...defaultSiteContent.food,...saved.food,suppliers:saved.food?.suppliers??defaultSiteContent.food.suppliers},
      sectionOrder:saved.sectionOrder??defaultSiteContent.sectionOrder} as SiteContent;
    return merged;
  } catch { return defaultSiteContent; }
}

export async function saveSiteContent(content: SiteContent) {
  await env.DB.prepare(schema).run();
  await env.DB.prepare("INSERT INTO site_content (id, content, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET content=excluded.content, updated_at=excluded.updated_at")
    .bind("main", JSON.stringify(content), new Date().toISOString()).run();
}

