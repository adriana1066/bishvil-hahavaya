import { env } from "cloudflare:workers";
import { defaultSiteContent, type SiteContent } from "./site-content";

const schema = `CREATE TABLE IF NOT EXISTS site_content (id TEXT PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT NOT NULL)`;

export async function getSiteContent(): Promise<SiteContent> {
  try {
    await env.DB.prepare(schema).run();
    const row = await env.DB.prepare("SELECT content FROM site_content WHERE id = ?").bind("main").first<{content:string}>();
    if (!row) return defaultSiteContent;
    const saved = JSON.parse(row.content) as Partial<SiteContent>;
    const oldOrder=saved.sectionOrder??defaultSiteContent.sectionOrder;
    const expandedOrder=oldOrder.flatMap(id=>id==="host"?["host","comparison","aunt"]:id==="food"?["food","suppliers"]:id) as SiteContent["sectionOrder"];
    const sectionOrder=[...new Set([...expandedOrder,...defaultSiteContent.sectionOrder])] as SiteContent["sectionOrder"];
    const hiddenSections=[...new Set([...(saved.hiddenSections??[]),...(oldOrder.includes("recognition")?[]:["recognition" as const])])];
    const navigation=(saved.site?.navigation??defaultSiteContent.site.navigation).map(item=>({...item,visible:item.visible!==false}));
    const merged = {...defaultSiteContent, ...saved,
      site:{...defaultSiteContent.site,...saved.site,navigation},
      opening:{...defaultSiteContent.opening,...saved.opening},
      story:{...defaultSiteContent.story,...saved.story},
      welcome:{...defaultSiteContent.welcome,...saved.welcome},
      host:{...defaultSiteContent.host,...saved.host,comparison:saved.host?.comparison??defaultSiteContent.host.comparison},
      service:{...defaultSiteContent.service,...saved.service},
      food:{...defaultSiteContent.food,...saved.food,suppliers:saved.food?.suppliers??defaultSiteContent.food.suppliers},
      mediaSettings:{...defaultSiteContent.mediaSettings,...saved.mediaSettings},
      sectionOrder,
      hiddenSections} as SiteContent;
    return merged;
  } catch { return defaultSiteContent; }
}

export async function saveSiteContent(content: SiteContent) {
  await env.DB.prepare(schema).run();
  await env.DB.prepare("INSERT INTO site_content (id, content, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET content=excluded.content, updated_at=excluded.updated_at")
    .bind("main", JSON.stringify(content), new Date().toISOString()).run();
}

