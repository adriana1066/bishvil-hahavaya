import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { hasAdminSession } from "../../../../lib/admin-auth";
import { getSiteContent, saveSiteContent } from "../../../../lib/content-store";

type TestResult = { name: string; ok: boolean; detail: string };

export async function POST(request: Request) {
  if (!(await hasAdminSession()))
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const original = await getSiteContent();
  const originalJson = JSON.stringify(original);
  const marker = `בדיקת-ניהול-${Date.now()}`;
  const testObjectKey = `site/admin-self-test-${crypto.randomUUID()}.svg`;
  const results: TestResult[] = [];

  try {
    const visible = original.sectionOrder.filter(
      (id) => !original.hiddenSections.includes(id),
    );
    const firstVisible = visible[0];
    const reordered = [...original.sectionOrder];
    if (reordered.length > 1)
      [reordered[0], reordered[1]] = [reordered[1], reordered[0]];

    const changed = {
      ...original,
      site: {
        ...original.site,
        brand: marker,
        navigation: original.site.navigation.map((item, index) =>
          index === 0 ? { ...item, label: marker, visible: true } : item,
        ),
      },
      sectionOrder: reordered,
      hiddenSections: firstVisible
        ? [...new Set([...original.hiddenSections, firstVisible])]
        : original.hiddenSections,
      mediaSettings: {
        ...original.mediaSettings,
        story: { ...original.mediaSettings.story, x: 37 },
      },
    };

    await saveSiteContent(changed);
    const saved = await getSiteContent();
    results.push({
      name: "עריכה ושמירה",
      ok: saved.site.brand === marker,
      detail: "טקסט ערוך נשמר במסד הנתונים",
    });
    results.push({
      name: "שינוי סדר",
      ok: saved.sectionOrder[0] === reordered[0],
      detail: "סדר האזורים נשמר",
    });
    results.push({
      name: "הסתרה והצגה",
      ok: !firstVisible || saved.hiddenSections.includes(firstVisible),
      detail: "מצב התצוגה של האזור נשמר",
    });
    results.push({
      name: "מיקום וחיתוך תמונה",
      ok: saved.mediaSettings.story.x === 37,
      detail: "מיקום התמונה נשמר",
    });
    results.push({
      name: "כפתורי ניווט",
      ok: saved.site.navigation[0]?.label === marker,
      detail: "שם ומצב כפתור הניווט נשמרו",
    });

    const origin = new URL(request.url).origin;
    let liveHtml = "";
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const response = await fetch(
        `${origin}/?admin-test=${Date.now()}-${attempt}`,
        {
          headers: {
            "cache-control": "no-cache, no-store, must-revalidate",
            pragma: "no-cache",
          },
        },
      );
      liveHtml = await response.text();
      if (liveHtml.includes(marker)) break;
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    results.push({
      name: "האתר החי",
      ok: liveHtml.includes(marker),
      detail: "השינוי שנשמר הופיע בפועל באתר החי",
    });

    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="#24402f"/></svg>';
    await env.BUCKET.put(testObjectKey, svg, {
      httpMetadata: { contentType: "image/svg+xml" },
    });
    const uploaded = await env.BUCKET.get(testObjectKey);
    results.push({
      name: "העלאת תמונה",
      ok: uploaded !== null && (await uploaded.text()) === svg,
      detail: "קובץ בדיקה הועלה ונקרא מאחסון התמונות",
    });
  } catch (error) {
    results.push({
      name: "הבדיקה האוטומטית",
      ok: false,
      detail: error instanceof Error ? error.message : "שגיאה לא ידועה",
    });
  } finally {
    await saveSiteContent(original);
    await env.BUCKET.delete(testObjectKey).catch(() => undefined);
  }

  const restored = JSON.stringify(await getSiteContent()) === originalJson;
  results.push({
    name: "שחזור התוכן המקורי",
    ok: restored,
    detail: "כל התוכן הוחזר בדיוק למצב שהיה לפני הבדיקה",
  });

  return NextResponse.json({
    ok: results.every((result) => result.ok),
    results,
  });
}
