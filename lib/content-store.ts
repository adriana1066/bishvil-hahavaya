import { env } from "cloudflare:workers";
import { defaultSiteContent, type SiteContent } from "./site-content";

const schema = `CREATE TABLE IF NOT EXISTS site_content (id TEXT PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT NOT NULL)`;

export async function getSiteContent(): Promise<SiteContent> {
  try {
    await env.DB.prepare(schema).run();
    const row = await env.DB.prepare(
      "SELECT content FROM site_content WHERE id = ?",
    )
      .bind("main")
      .first<{ content: string }>();
    if (!row) return defaultSiteContent;
    const saved = JSON.parse(row.content) as Partial<SiteContent>;
    const oldOrder = saved.sectionOrder ?? defaultSiteContent.sectionOrder;
    const expandedOrder = oldOrder.flatMap((id) =>
      id === "host"
        ? ["host", "comparison", "aunt"]
        : id === "food"
          ? ["food", "suppliers"]
          : id,
    ) as SiteContent["sectionOrder"];
    const sectionOrder = [
      ...new Set([...expandedOrder, ...defaultSiteContent.sectionOrder]),
    ] as SiteContent["sectionOrder"];
    const hiddenSections = [
      ...new Set([
        ...(saved.hiddenSections ?? []),
        ...(oldOrder.includes("recognition") ? [] : ["recognition" as const]),
        ...(oldOrder.includes("community") ? [] : ["community" as const]),
      ]),
    ];
    const navigation = (
      saved.site?.navigation ?? defaultSiteContent.site.navigation
    ).map((item) => ({ ...item, visible: item.visible !== false }));
    const merged = {
      ...defaultSiteContent,
      ...saved,
      site: { ...defaultSiteContent.site, ...saved.site, navigation },
      opening: { ...defaultSiteContent.opening, ...saved.opening },
      design: { ...defaultSiteContent.design, ...saved.design },
      story: { ...defaultSiteContent.story, ...saved.story },
      welcome: { ...defaultSiteContent.welcome, ...saved.welcome },
      host: {
        ...defaultSiteContent.host,
        ...saved.host,
        comparison:
          saved.host?.comparison ?? defaultSiteContent.host.comparison,
      },
      service: { ...defaultSiteContent.service, ...saved.service },
      events: {
        ...defaultSiteContent.events,
        ...saved.events,
        items: (saved.events?.items ?? defaultSiteContent.events.items).map(
          (item, index) =>
            typeof item === "string"
              ? {
                  text: item,
                  iconSet: (index < 5 ? index : "none") as
                    0 | 1 | 2 | 3 | 4 | "none",
                  iconSize: 100,
                  iconX: 0,
                  iconY: 0,
                }
              : { iconSize: 100, iconX: 0, iconY: 0, ...item },
        ),
      },
      food: {
        ...defaultSiteContent.food,
        ...saved.food,
        suppliers: (
          saved.food?.suppliers ?? defaultSiteContent.food.suppliers
        ).map((supplier, index) => ({
          visible: true,
          slug: `supplier-${index + 1}`,
          body: "",
          linkMode: "page" as const,
          link: "",
          ...supplier,
        })),
      },
      community: {
        ...defaultSiteContent.community,
        ...saved.community,
        collections: (
          saved.community?.collections ??
          defaultSiteContent.community.collections
        ).map((collection, collectionIndex) => ({
          id: `collection-${collectionIndex + 1}`,
          visible: true,
          kicker: "",
          title: "אוסף כרטיסים",
          description: "",
          template: "square" as const,
          columns: 3 as const,
          ...collection,
          items: (collection.items ?? []).map((item, index) => ({
            id: `card-${index + 1}`,
            visible: true,
            title: "",
            subtitle: "",
            summary: "",
            image: "",
            imageAlt: "",
            slug: `card-${index + 1}`,
            body: "",
            link: "",
            linkMode: "page" as const,
            ...item,
          })),
        })),
      },
      mediaSettings: {
        ...defaultSiteContent.mediaSettings,
        ...saved.mediaSettings,
      },
      textStyles: { ...defaultSiteContent.textStyles, ...saved.textStyles },
      sectionOrder,
      hiddenSections,
    } as SiteContent;
    return merged;
  } catch {
    return defaultSiteContent;
  }
}

export async function saveSiteContent(content: SiteContent) {
  await env.DB.prepare(schema).run();
  await env.DB.prepare(
    "INSERT INTO site_content (id, content, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET content=excluded.content, updated_at=excluded.updated_at",
  )
    .bind("main", JSON.stringify(content), new Date().toISOString())
    .run();
}
