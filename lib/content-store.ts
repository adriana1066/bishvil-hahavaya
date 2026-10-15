import { env } from "cloudflare:workers";
import { defaultSiteContent, type SiteContent } from "./site-content";

const schema = `CREATE TABLE IF NOT EXISTS site_content (id TEXT PRIMARY KEY, content TEXT NOT NULL, updated_at TEXT NOT NULL)`;

export async function getSiteContent(): Promise<SiteContent> {
  try {
    await env.DB.prepare(schema).run();
    const row = await env.DB.prepare("SELECT content FROM site_content WHERE id = ?").bind("main").first<{content:string}>();
    if (!row) return defaultSiteContent;
    const saved = JSON.parse(row.content) as Partial<SiteContent>;
    const previousOrder = saved.sectionOrder || defaultSiteContent.sectionOrder;
    const sectionOrder = ["story", "welcome", "service", ...previousOrder.filter(id => !["story", "welcome", "service", "recognition"].includes(id))] as SiteContent["sectionOrder"];
    const merged = {...defaultSiteContent, ...saved, opening:{...defaultSiteContent.opening,...saved.opening}, story:{...defaultSiteContent.story,...saved.story}, host:{...defaultSiteContent.host,...saved.host}, sectionOrder} as SiteContent;
    const serviceOrder = ["שפע", "נראות", "זרימה", "תחושה"];
    merged.service = {
      ...merged.service,
      items: [...merged.service.items].sort((a, b) => serviceOrder.indexOf(a.title) - serviceOrder.indexOf(b.title)),
    };
    if (merged.story.accent === "אירוע שנשמר.") merged.story = {...merged.story, accent:"אירוע שנשאר."};
    if (merged.welcome.title === "המסיבה התחילה כבר לפני חצי שעה.") merged.welcome = {...merged.welcome, title:"הגעתי לאירוע באיחור של שעה וחצי."};
    if (merged.welcome.accent === "אז איך יכול להיות שהכול עדיין נראה כאילו האורחים עוד לא הגיעו?") merged.welcome = {...merged.welcome, accent:"והכול עדיין נראה כאילו האירוע התחיל לפני חמש דקות."};
    if (merged.welcome.accent === "והכול עדיין נראה כאילו האירוע התחיל לפני חמש דקות.") merged.welcome = {...merged.welcome, accent:"ונראה כאילו האירוע התחיל רק עכשיו!"};
    if (merged.food.title === "קולינריה טבעונית עשירה, חגיגית ומפתיעה.") merged.food = {...merged.food, title:"קולינריה עשירה, חגיגית ומפתיעה."};
    if (merged.food.text1 === "השירות מיועד לאירועים שבהם מוגש אוכל טבעוני, וניתן גם באירועים שבהם מוגש אוכל צמחוני. המארחים עצמם אינם צריכים להיות טבעונים — הבחירה מתייחסת לאוכל באירוע.") merged.food = {...merged.food, text1:"בעבודה שלי אני משרתת ארוחות צמחיות משובחות, ולשמחתי זה מאפשר לי, בין השאר, גם לעבוד עם הטבחים הנפלאים של העולם החדש."};
    if (merged.food.text2 === "למי שעדיין לא בחרו הסעדה, אוכל לחבר בין האירוע לבין אפשרויות טבעוניות משובחות ומתאימות.") merged.food = {...merged.food, text2:"אז אם עדיין לא בחרת מה יעלה על השולחן שלך באירוע — אני מזמינה אותך להכיר את המטבחים שמביאים את העולם הזה אלינו, לפגוש את המנות הנהדרות שנולדות בכל אחד מהם, ולבחור מתוכם את המטבח שהכי מתאים לאירוע הקרוב."};
    if (merged.food.text2 === "אז אם עדיין לא בחרת מה יעלה על השולחן שלך באירוע — אני מזמינה אותך להכיר את המטבחים שמביאים את העולם הזה אלינו, לפגוש את המנות הנהדרות שנולדות בכל אחד מהם, ולבחור מתוכם את המטבח שהכי מתאים לאירוע הקרוב.") merged.food = {...merged.food, text2:"אז אם עדיין לא בחרת מה יעלה על השולחן שלך באירוע – אני מזמינה אותך להכיר את המטבחים שמביאים את העולם הזה אלינו, לפגוש את המנות הנהדרות שנולדות בכל אחד מהם, ולבחור מתוכם את המטבח שהכי מתאים לאירוע הקרוב."};
    if (merged.host.title === "להיות המארחת. לא לנהל את הערב מן הצד.") merged.host = defaultSiteContent.host;
    return merged;
  } catch { return defaultSiteContent; }
}

export async function saveSiteContent(content: SiteContent) {
  await env.DB.prepare(schema).run();
  await env.DB.prepare("INSERT INTO site_content (id, content, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET content=excluded.content, updated_at=excluded.updated_at")
    .bind("main", JSON.stringify(content), new Date().toISOString()).run();
}
