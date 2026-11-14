"use client";
import { useMemo, useState } from "react";
import type {
  MediaSetting,
  SectionId,
  SiteContent,
} from "../../lib/site-content";
import "./manage.css";

const labels: Record<SectionId, string> = {
  story: "תמונת האירוע והמסר",
  welcome: "סרטון הכניסה לאירוע",
  recognition: "הרגע המוכר",
  host: "המארחת בתוך האירוע",
  comparison: "גלריית לפני ואחרי",
  aunt: "סרטון הדודה",
  service: "מה עושה נוצרת",
  promise: "החוויה שנשארת",
  events: "למי זה מתאים",
  food: "קולינריה",
  suppliers: "ספקי האוכל",
  process: "איך מתחילים",
  contact: "יצירת קשר",
};
const sectionText: Partial<Record<SectionId, Array<[string, string]>>> = {
  story: [
    ["eyebrow", "שורת פתיחה"],
    ["title", "כותרת ראשית"],
    ["accent", "שורה מודגשת"],
    ["text", "טקסט קצר"],
    ["visionLabel", "הכיתוב על התמונה"],
  ],
  welcome: [
    ["title", "כותרת ראשית"],
    ["accent", "שורה מודגשת"],
  ],
  recognition: [
    ["kicker", "כותרת קטנה"],
    ["title", "כותרת ראשית"],
    ["large", "משפט גדול"],
    ["text1", "פסקה ראשונה"],
    ["text2", "פסקה שנייה"],
  ],
  host: [
    ["kicker", "כותרת קטנה"],
    ["title", "כותרת ראשית"],
    ["text", "הסבר"],
    ["quote", "ציטוט"],
  ],
  service: [
    ["kicker", "כותרת קטנה"],
    ["title", "שם התפקיד"],
    ["origin", "פירוש השם"],
    ["lead", "פסקת פתיחה"],
  ],
  promise: [
    ["kicker", "כותרת קטנה"],
    ["title", "כותרת ראשית"],
    ["accent", "שורה מודגשת"],
  ],
  events: [
    ["kicker", "כותרת קטנה"],
    ["title", "כותרת ראשית"],
  ],
  food: [
    ["kicker", "כותרת קטנה"],
    ["title", "כותרת ראשית"],
    ["text1", "פסקה ראשונה"],
    ["text2", "פסקה שנייה"],
  ],
  process: [
    ["kicker", "כותרת קטנה"],
    ["title", "כותרת ראשית"],
  ],
  contact: [
    ["kicker", "כותרת קטנה"],
    ["title", "כותרת ראשית"],
    ["button", "טקסט בכפתור"],
    ["phone", "טלפון"],
  ],
};

export default function ManageClient({ initial }: { initial: SiteContent }) {
  const [content, setContent] = useState(initial),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [previewKey, setPreviewKey] = useState(0),
    [open, setOpen] = useState<string>("opening");
  const visibleCount = useMemo(
    () =>
      content.sectionOrder.filter((id) => !content.hiddenSections.includes(id))
        .length,
    [content],
  );
  const update = (id: SectionId, key: string, value: unknown) =>
    setContent((c) => ({
      ...c,
      [id]: {
        ...((c as unknown as Record<string, unknown>)[id] as object),
        [key]: value,
      },
    }));
  const moveSection = (id: SectionId, delta: number) =>
    setContent((c) => {
      const a = [...c.sectionOrder],
        i = a.indexOf(id),
        j = i + delta;
      if (j < 0 || j >= a.length) return c;
      [a[i], a[j]] = [a[j], a[i]];
      return { ...c, sectionOrder: a };
    });
  const toggleSection = (id: SectionId) =>
    setContent((c) => ({
      ...c,
      hiddenSections: c.hiddenSections.includes(id)
        ? c.hiddenSections.filter((x) => x !== id)
        : [...c.hiddenSections, id],
    }));
  const save = async () => {
    setBusy(true);
    setStatus("שומר...");
    try {
      const r = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!r.ok) throw new Error();
      setStatus("נשמר. התצוגה והאתר נטענו מחדש מן הנתונים השמורים.");
      setPreviewKey((x) => x + 1);
    } catch {
      setStatus("השמירה לא הצליחה. השינויים עדיין נמצאים במסך.");
    } finally {
      setBusy(false);
    }
  };
  const runFullTest = async () => {
    setBusy(true);
    setStatus("מריץ בדיקה מלאה ושומר עותק בטוח של התוכן...");
    try {
      const response = await fetch("/api/admin/self-test", { method: "POST" });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        liveBrand?: string;
        results?: Array<{ name: string; ok: boolean; detail: string }>;
      };
      if (!response.ok) throw new Error(data.error || "הבדיקה לא הצליחה");
      const liveResponse = await fetch(`/?admin-live-check=${Date.now()}`, {
        cache: "no-store",
      });
      const liveHtml = await liveResponse.text();
      const liveOk =
        liveResponse.ok &&
        typeof data.liveBrand === "string" &&
        liveHtml.includes(data.liveBrand);
      const failed = data.results?.filter((result) => !result.ok) ?? [];
      if (!liveOk)
        failed.push({
          name: "האתר החי",
          ok: false,
          detail: "האתר החי לא החזיר את התוכן השמור",
        });
      const allOk = data.ok && liveOk;
      setStatus(
        allOk
          ? "הבדיקה המלאה הצליחה. כל הפעולות נשמרו, הופיעו באתר החי והתוכן המקורי שוחזר."
          : `הבדיקה הסתיימה עם בעיה: ${failed.map((result) => result.name).join(", ")}`,
      );
      setPreviewKey((value) => value + 1);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "הבדיקה האוטומטית נכשלה",
      );
    } finally {
      setBusy(false);
    }
  };
  const upload = async (file: File, apply: (url: string) => void) => {
    setBusy(true);
    setStatus(`מעלה ${file.type.startsWith("video/") ? "סרטון" : "תמונה"}...`);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/uploads", { method: "POST", body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      apply(data.url);
      setStatus("הקובץ הועלה. לחצי על שמירת השינויים כדי לפרסם אותו באתר.");
    } catch (e) {
      setStatus(
        e instanceof Error && e.message ? e.message : "העלאת הקובץ נכשלה",
      );
    } finally {
      setBusy(false);
    }
  };
  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    rows = 2,
  ) => (
    <label>
      {label}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
  const mediaControl = (key: string) => {
    const m = content.mediaSettings[key] ?? {
      x: 50,
      y: 50,
      fit: "cover" as const,
    };
    const set = (p: Partial<MediaSetting>) =>
      setContent((c) => ({
        ...c,
        mediaSettings: { ...c.mediaSettings, [key]: { ...m, ...p } },
      }));
    return (
      <div className="media-controls">
        <strong>מיקום וחיתוך התמונה</strong>
        <label>
          מיקום לרוחב <output>{m.x}%</output>
          <input
            type="range"
            min="0"
            max="100"
            value={m.x}
            onChange={(e) => set({ x: Number(e.target.value) })}
          />
        </label>
        <label>
          מיקום לגובה <output>{m.y}%</output>
          <input
            type="range"
            min="0"
            max="100"
            value={m.y}
            onChange={(e) => set({ y: Number(e.target.value) })}
          />
        </label>
        <label>
          אופן התצוגה
          <select
            value={m.fit}
            onChange={(e) =>
              set({ fit: e.target.value as MediaSetting["fit"] })
            }
          >
            <option value="cover">מילוי וחיתוך</option>
            <option value="contain">הצגת התמונה בשלמותה</option>
          </select>
        </label>
      </div>
    );
  };
  const fileField = (
    label: string,
    value: string,
    accept: string,
    onValue: (v: string) => void,
  ) => (
    <label className="file-field">
      {label}
      <input
        dir="ltr"
        value={value}
        onChange={(e) => onValue(e.target.value)}
      />
      <input
        type="file"
        accept={accept}
        onChange={(e) =>
          e.target.files?.[0] && upload(e.target.files[0], onValue)
        }
      />
    </label>
  );
  const itemList = (
    id: SectionId,
    items: Array<string | { title: string; text: string }>,
  ) => (
    <div className="list-editor">
      <h3>פריטי הרשימה</h3>
      {items.map((item, i) => (
        <div className="list-item-editor" key={i}>
          <div className="list-item-actions">
            <button
              disabled={i === 0}
              onClick={() => {
                const a = [...items];
                [a[i - 1], a[i]] = [a[i], a[i - 1]];
                update(id, "items", a);
              }}
            >
              ↑
            </button>
            <button
              disabled={i === items.length - 1}
              onClick={() => {
                const a = [...items];
                [a[i + 1], a[i]] = [a[i], a[i + 1]];
                update(id, "items", a);
              }}
            >
              ↓
            </button>
            <button
              onClick={() =>
                update(
                  id,
                  "items",
                  items.filter((_, n) => n !== i),
                )
              }
            >
              מחיקה
            </button>
          </div>
          {typeof item === "string" ? (
            field(`פריט ${i + 1}`, item, (v) => {
              const a = [...items] as string[];
              a[i] = v;
              update(id, "items", a);
            })
          ) : (
            <div className="paired">
              <input
                value={item.title}
                aria-label="כותרת"
                onChange={(e) => {
                  const a = [...items] as { title: string; text: string }[];
                  a[i] = { ...a[i], title: e.target.value };
                  update(id, "items", a);
                }}
              />
              <textarea
                value={item.text}
                aria-label="טקסט"
                onChange={(e) => {
                  const a = [...items] as { title: string; text: string }[];
                  a[i] = { ...a[i], text: e.target.value };
                  update(id, "items", a);
                }}
              />
            </div>
          )}
        </div>
      ))}
      <button
        className="add-button"
        onClick={() =>
          update(id, "items", [
            ...items,
            items.length && typeof items[0] !== "string"
              ? { title: "", text: "" }
              : "",
          ])
        }
      >
        הוספת פריט
      </button>
    </div>
  );
  const navMove = (i: number, d: number) =>
    setContent((c) => {
      const a = [...c.site.navigation],
        j = i + d;
      if (j < 0 || j >= a.length) return c;
      [a[i], a[j]] = [a[j], a[i]];
      return { ...c, site: { ...c.site, navigation: a } };
    });
  const sectionBody = (id: SectionId) => {
    const data = ((content as unknown as Record<string, unknown>)[id] ??
      {}) as Record<string, unknown>;
    return (
      <>
        {sectionText[id]?.map(([key, label]) =>
          field(
            label,
            String(data[key] ?? ""),
            (v) => update(id, key, v),
            String(data[key] ?? "").length > 90 ? 5 : 2,
          ),
        )}
        {id === "story" && (
          <>
            {fileField("תמונת האזור", content.story.image, "image/*", (v) =>
              update(id, "image", v),
            )}
            {field("תיאור התמונה", content.story.imageAlt, (v) =>
              update(id, "imageAlt", v),
            )}
            {mediaControl("story")}
          </>
        )}
        {id === "welcome" && (
          <>
            {fileField("סרטון", content.welcome.video, "video/mp4", (v) =>
              update(id, "video", v),
            )}
            {fileField(
              "תמונת פתיחה לסרטון",
              content.welcome.image,
              "image/*",
              (v) => update(id, "image", v),
            )}
            {mediaControl("welcome")}
          </>
        )}
        {id === "host" &&
          fileField("סרטון הרקע", content.host.video, "video/mp4", (v) =>
            update(id, "video", v),
          )}
        {id === "comparison" && (
          <div>
            {content.host.comparison.map((x, i) => (
              <div className="image-card" key={i}>
                <div className="list-item-actions">
                  <button
                    disabled={i === 0}
                    onClick={() => {
                      const a = [...content.host.comparison];
                      [a[i - 1], a[i]] = [a[i], a[i - 1]];
                      update("host", "comparison", a);
                    }}
                  >
                    ↑
                  </button>
                  <button
                    disabled={i === content.host.comparison.length - 1}
                    onClick={() => {
                      const a = [...content.host.comparison];
                      [a[i + 1], a[i]] = [a[i], a[i + 1]];
                      update("host", "comparison", a);
                    }}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() =>
                      update(
                        "host",
                        "comparison",
                        content.host.comparison.filter((_, n) => n !== i),
                      )
                    }
                  >
                    מחיקה
                  </button>
                </div>
                <h3>תמונת השוואה {i + 1}</h3>
                {fileField("תמונה", x.image, "image/*", (v) => {
                  const a = [...content.host.comparison];
                  a[i] = { ...a[i], image: v };
                  update("host", "comparison", a);
                })}
                {field("תיאור התמונה", x.alt, (v) => {
                  const a = [...content.host.comparison];
                  a[i] = { ...a[i], alt: v };
                  update("host", "comparison", a);
                })}
                {mediaControl(`comparison${i}`)}
              </div>
            ))}
            <button
              className="add-button"
              onClick={() =>
                update("host", "comparison", [
                  ...content.host.comparison,
                  { image: "", alt: "" },
                ])
              }
            >
              הוספת תמונה לגלריה
            </button>
          </div>
        )}
        {id === "aunt" && (
          <>
            {fileField(
              "סרטון הדודה",
              content.host.auntVideo,
              "video/mp4",
              (v) => update("host", "auntVideo", v),
            )}
            {fileField(
              "תמונת הפתיחה לסרטון",
              content.host.auntPoster,
              "image/*",
              (v) => update("host", "auntPoster", v),
            )}
            {field("תיאור הסרטון", content.host.auntLabel, (v) =>
              update("host", "auntLabel", v),
            )}
          </>
        )}
        {id === "service" && (
          <>
            {fileField("תמונת אדריאנה", content.service.image, "image/*", (v) =>
              update(id, "image", v),
            )}
            {field("תיאור התמונה", content.service.imageAlt, (v) =>
              update(id, "imageAlt", v),
            )}
            {mediaControl("service")}
          </>
        )}
        {id === "food" && (
          <>
            {fileField("תמונת הקולינריה", content.food.image, "image/*", (v) =>
              update(id, "image", v),
            )}
            {field("תיאור התמונה", content.food.imageAlt, (v) =>
              update(id, "imageAlt", v),
            )}
            {mediaControl("food")}
          </>
        )}
        {id === "suppliers" && (
          <>
            {field("כותרת אזור הספקים", content.food.suppliersTitle, (v) =>
              update("food", "suppliersTitle", v),
            )}
            {content.food.suppliers.map((s, i) => (
              <div className="supplier-editor" key={i}>
                <div className="list-item-actions">
                  <button
                    disabled={i === 0}
                    onClick={() => {
                      const a = [...content.food.suppliers];
                      [a[i - 1], a[i]] = [a[i], a[i - 1]];
                      update("food", "suppliers", a);
                    }}
                  >
                    ↑
                  </button>
                  <button
                    disabled={i === content.food.suppliers.length - 1}
                    onClick={() => {
                      const a = [...content.food.suppliers];
                      [a[i + 1], a[i]] = [a[i], a[i + 1]];
                      update("food", "suppliers", a);
                    }}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() =>
                      update(
                        "food",
                        "suppliers",
                        content.food.suppliers.filter((_, n) => n !== i),
                      )
                    }
                  >
                    מחיקה
                  </button>
                </div>
                {(
                  ["name", "owner", "specialty", "fit", "imageAlt"] as const
                ).map((k) =>
                  field(
                    {
                      name: "שם הספק",
                      owner: "שם בעלת העסק",
                      specialty: "מה מביאים לשולחן",
                      fit: "מתאים ל־",
                      imageAlt: "תיאור התמונה",
                    }[k],
                    s[k],
                    (v) => {
                      const a = [...content.food.suppliers];
                      a[i] = { ...a[i], [k]: v };
                      update("food", "suppliers", a);
                    },
                  ),
                )}
                {fileField("תמונת הספק", s.image, "image/*", (v) => {
                  const a = [...content.food.suppliers];
                  a[i] = { ...a[i], image: v };
                  update("food", "suppliers", a);
                })}
                <h4>קישורים</h4>
                {s.links.map((l, j) => (
                  <div className="linked-row" key={j}>
                    <div className="paired">
                      <input
                        value={l.label}
                        aria-label="שם הקישור"
                        onChange={(e) => {
                          const a = [...content.food.suppliers],
                            links = [...a[i].links];
                          links[j] = { ...links[j], label: e.target.value };
                          a[i] = { ...a[i], links };
                          update("food", "suppliers", a);
                        }}
                      />
                      <input
                        dir="ltr"
                        value={l.href}
                        aria-label="כתובת הקישור"
                        onChange={(e) => {
                          const a = [...content.food.suppliers],
                            links = [...a[i].links];
                          links[j] = { ...links[j], href: e.target.value };
                          a[i] = { ...a[i], links };
                          update("food", "suppliers", a);
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const a = [...content.food.suppliers];
                        a[i] = {
                          ...a[i],
                          links: a[i].links.filter((_, n) => n !== j),
                        };
                        update("food", "suppliers", a);
                      }}
                    >
                      הסרת קישור
                    </button>
                  </div>
                ))}
                <button
                  className="add-button"
                  onClick={() => {
                    const a = [...content.food.suppliers];
                    a[i] = {
                      ...a[i],
                      links: [...a[i].links, { label: "", href: "" }],
                    };
                    update("food", "suppliers", a);
                  }}
                >
                  הוספת קישור לספק
                </button>
              </div>
            ))}
            <button
              className="add-button"
              onClick={() =>
                update("food", "suppliers", [
                  ...content.food.suppliers,
                  {
                    name: "",
                    owner: "",
                    image: "",
                    imageAlt: "",
                    specialty: "",
                    fit: "",
                    links: [],
                  },
                ])
              }
            >
              הוספת ספק
            </button>
          </>
        )}
        {Array.isArray(data.items) &&
          itemList(
            id,
            data.items as Array<string | { title: string; text: string }>,
          )}
      </>
    );
  };
  return (
    <main className="manager" dir="rtl">
      <header className="manager-head">
        <div>
          <p>חדר הניהול של אדריאנה הראל</p>
          <h1>עריכת „בשביל ההוויה”</h1>
        </div>
        <div className="manager-actions">
          <a href="/" target="_blank">
            צפייה באתר
          </a>
          <button onClick={save} disabled={busy}>
            שמירת כל השינויים
          </button>
          <button onClick={runFullTest} disabled={busy}>
            בדיקה מלאה
          </button>
        </div>
      </header>
      <div className="manager-summary">
        <strong>{visibleCount} אזורים מוצגים באתר</strong>
        <span>כל אזור נפתח לעריכה, נשמר במסד הנתונים ומופיע באתר החי.</span>
      </div>
      <div className="structure-editor">
        <details
          open={open === "site"}
          onToggle={(e) => e.currentTarget.open && setOpen("site")}
        >
          <summary>
            <span>הכותרת העליונה, הניווט והתחתית</span>
            <b>{content.site.headerVisible ? "מוצג" : "מוסתר"}</b>
          </summary>
          <div className="panel-body">
            <label className="switch">
              <input
                type="checkbox"
                checked={content.site.headerVisible}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    site: { ...c.site, headerVisible: e.target.checked },
                  }))
                }
              />{" "}
              הצגת הכותרת העליונה
            </label>
            {field("שם המותג", content.site.brand, (v) =>
              setContent((c) => ({ ...c, site: { ...c.site, brand: v } })),
            )}
            <label className="switch">
              <input
                type="checkbox"
                checked={content.site.navigationVisible}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    site: { ...c.site, navigationVisible: e.target.checked },
                  }))
                }
              />{" "}
              הצגת כל שורת הניווט
            </label>
            <h3>כפתורי הניווט</h3>
            {content.site.navigation.map((n, i) => (
              <div className="nav-editor" key={i}>
                <div className="list-item-actions">
                  <button disabled={i === 0} onClick={() => navMove(i, -1)}>
                    ↑
                  </button>
                  <button
                    disabled={i === content.site.navigation.length - 1}
                    onClick={() => navMove(i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() =>
                      setContent((c) => ({
                        ...c,
                        site: {
                          ...c.site,
                          navigation: c.site.navigation.filter(
                            (_, j) => j !== i,
                          ),
                        },
                      }))
                    }
                  >
                    מחיקה
                  </button>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={n.visible !== false}
                    onChange={(e) =>
                      setContent((c) => {
                        const a = [...c.site.navigation];
                        a[i] = { ...a[i], visible: e.target.checked };
                        return { ...c, site: { ...c.site, navigation: a } };
                      })
                    }
                  />{" "}
                  הכפתור מוצג
                </label>
                {field("שם הכפתור", n.label, (v) =>
                  setContent((c) => {
                    const a = [...c.site.navigation];
                    a[i] = { ...a[i], label: v };
                    return { ...c, site: { ...c.site, navigation: a } };
                  }),
                )}
                {field("הקישור", n.href, (v) =>
                  setContent((c) => {
                    const a = [...c.site.navigation];
                    a[i] = { ...a[i], href: v };
                    return { ...c, site: { ...c.site, navigation: a } };
                  }),
                )}
              </div>
            ))}
            <button
              className="add-button"
              onClick={() =>
                setContent((c) => ({
                  ...c,
                  site: {
                    ...c.site,
                    navigation: [
                      ...c.site.navigation,
                      { label: "כפתור חדש", href: "#", visible: true },
                    ],
                  },
                }))
              }
            >
              הוספת כפתור
            </button>
            <h3>פרטי האתר וקישור הוואטסאפ</h3>
            {field("שם האתר בדפדפן", content.site.browserTitle, (v) =>
              setContent((c) => ({
                ...c,
                site: { ...c.site, browserTitle: v },
              })),
            )}
            {field(
              "תיאור האתר למנועי חיפוש",
              content.site.description,
              (v) =>
                setContent((c) => ({
                  ...c,
                  site: { ...c.site, description: v },
                })),
              4,
            )}
            {field("מספר הוואטסאפ", content.site.whatsappNumber, (v) =>
              setContent((c) => ({
                ...c,
                site: { ...c.site, whatsappNumber: v },
              })),
            )}
            {field(
              "הודעת הוואטסאפ המוכנה",
              content.site.whatsappMessage,
              (v) =>
                setContent((c) => ({
                  ...c,
                  site: { ...c.site, whatsappMessage: v },
                })),
              3,
            )}
            <h3>תחתית האתר</h3>
            <label className="switch">
              <input
                type="checkbox"
                checked={content.site.footerVisible}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    site: { ...c.site, footerVisible: e.target.checked },
                  }))
                }
              />{" "}
              הצגת תחתית האתר
            </label>
            {field("טקסט בתחתית", content.site.footerText, (v) =>
              setContent((c) => ({ ...c, site: { ...c.site, footerText: v } })),
            )}
            {fileField(
              "לוגו בתחתית",
              content.site.footerImage,
              "image/*",
              (v) =>
                setContent((c) => ({
                  ...c,
                  site: { ...c.site, footerImage: v },
                })),
            )}
            {field("תיאור הלוגו", content.site.footerAlt, (v) =>
              setContent((c) => ({ ...c, site: { ...c.site, footerAlt: v } })),
            )}
            {mediaControl("footer")}
          </div>
        </details>
        <details
          open={open === "opening"}
          onToggle={(e) => e.currentTarget.open && setOpen("opening")}
        >
          <summary>
            <span>עמוד הפתיחה</span>
            <b>מוצג</b>
          </summary>
          <div className="panel-body">
            <div className="opening-approved-previews">
              <figure>
                <figcaption>מחשב</figcaption>
                <img src={content.opening.desktopImage} alt="תצוגת מחשב" />
              </figure>
              <figure className="opening-mobile-preview">
                <figcaption>טלפון</figcaption>
                <img src={content.opening.mobileImage} alt="תצוגת טלפון" />
              </figure>
            </div>
            {fileField(
              "תמונת פתיחה במחשב",
              content.opening.desktopImage,
              "image/*",
              (v) =>
                setContent((c) => ({
                  ...c,
                  opening: { ...c.opening, desktopImage: v },
                })),
            )}
            {fileField(
              "תמונת פתיחה בטלפון",
              content.opening.mobileImage,
              "image/*",
              (v) =>
                setContent((c) => ({
                  ...c,
                  opening: { ...c.opening, mobileImage: v },
                })),
            )}
            {field("תיאור התמונות", content.opening.imageAlt, (v) =>
              setContent((c) => ({
                ...c,
                opening: { ...c.opening, imageAlt: v },
              })),
            )}
            {field("הזמנה לכניסה", content.opening.enter, (v) =>
              setContent((c) => ({
                ...c,
                opening: { ...c.opening, enter: v },
              })),
            )}
            {field("תחילת השביל", content.opening.journeyStart, (v) =>
              setContent((c) => ({
                ...c,
                opening: { ...c.opening, journeyStart: v },
              })),
            )}
            {field("מילת החיבור", content.opening.journeyBridge, (v) =>
              setContent((c) => ({
                ...c,
                opening: { ...c.opening, journeyBridge: v },
              })),
            )}
            {field("יעד השביל", content.opening.journeyArrival, (v) =>
              setContent((c) => ({
                ...c,
                opening: { ...c.opening, journeyArrival: v },
              })),
            )}
          </div>
        </details>
        {content.sectionOrder.map((id, i) => (
          <details
            key={id}
            open={open === id}
            onToggle={(e) => e.currentTarget.open && setOpen(id)}
          >
            <summary>
              <span>
                {i + 1}. {labels[id]}
              </span>
              <span className="summary-actions">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={(e) => {
                    e.preventDefault();
                    moveSection(id, -1);
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === content.sectionOrder.length - 1}
                  onClick={(e) => {
                    e.preventDefault();
                    moveSection(id, 1);
                  }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={
                    content.hiddenSections.includes(id)
                      ? "is-hidden"
                      : "is-visible"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSection(id);
                  }}
                >
                  {content.hiddenSections.includes(id)
                    ? "מוסתר - להצגה"
                    : "מוצג - להסתרה"}
                </button>
              </span>
            </summary>
            <div className="panel-body">{sectionBody(id)}</div>
          </details>
        ))}
      </div>
      <aside className="full-preview">
        <h2>תצוגת האתר החי לאחר השמירה</h2>
        <iframe
          key={previewKey}
          title="תצוגת האתר"
          src={`/?editorPreview=${previewKey}`}
        />
      </aside>
      <div className="save-dock">
        <span role="status">{status || "השינויים נשארים במסך עד לשמירה"}</span>
        <button onClick={save} disabled={busy}>
          {busy ? "שומר..." : "שמירת כל השינויים"}
        </button>
      </div>
    </main>
  );
}
