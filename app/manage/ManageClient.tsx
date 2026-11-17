"use client";
import { useMemo, useState } from "react";
import type {
  MediaSetting,
  SectionId,
  SiteContent,
  TextStyle,
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
  community: "הקהילה — אוספי כרטיסים",
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
  community: [
    ["kicker", "כותרת קטנה"],
    ["title", "כותרת האוסף"],
    ["description", "תיאור קצר"],
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
  const typographyControl = (styleKey: string) => {
    const style = content.textStyles[styleKey] ?? {};
    const setStyle = (patch: Partial<TextStyle>) =>
      setContent((current) => ({
        ...current,
        textStyles: {
          ...current.textStyles,
          [styleKey]: { ...(current.textStyles[styleKey] ?? {}), ...patch },
        },
      }));
    const reset = () =>
      setContent((current) => {
        const textStyles = { ...current.textStyles };
        delete textStyles[styleKey];
        return { ...current, textStyles };
      });
    return (
      <details className="typography-control">
        <summary>עיצוב הכתב</summary>
        <div className="typography-toolbar">
          <label>
            סוג הכתב
            <select
              value={style.fontFamily ?? "inherit"}
              onChange={(e) =>
                setStyle({
                  fontFamily: e.target.value as TextStyle["fontFamily"],
                })
              }
            >
              <option value="inherit">עיצוב האתר</option>
              <option value="display">הכתב הכותרתי</option>
              <option value="sans">כתב נקי</option>
              <option value="serif">כתב ספרותי</option>
            </select>
          </label>
          <label>
            גודל
            <span className="number-with-unit">
              <input
                type="number"
                min="8"
                max="180"
                value={style.fontSize ?? ""}
                placeholder="ברירת מחדל"
                onChange={(e) =>
                  setStyle({
                    fontSize: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
              <span>פיקסלים</span>
            </span>
          </label>
          <label>
            עובי
            <select
              value={style.fontWeight ?? "inherit"}
              onChange={(e) =>
                setStyle({
                  fontWeight: e.target.value as TextStyle["fontWeight"],
                })
              }
            >
              <option value="inherit">עיצוב האתר</option>
              <option value="400">רגיל</option>
              <option value="500">בינוני</option>
              <option value="600">מודגש</option>
              <option value="700">מודגש מאוד</option>
              <option value="800">כבד</option>
            </select>
          </label>
          <div className="type-buttons" aria-label="הדגשה וסגנון">
            <button
              type="button"
              className={style.italic ? "active" : ""}
              onClick={() => setStyle({ italic: !style.italic })}
            >
              <i>נטוי</i>
            </button>
            <button
              type="button"
              className={style.underline ? "active" : ""}
              onClick={() => setStyle({ underline: !style.underline })}
            >
              <u>קו תחתי</u>
            </button>
          </div>
          <label>
            צבע
            <span className="color-control">
              <input
                type="color"
                value={
                  style.color && /^#[0-9a-f]{6}$/i.test(style.color)
                    ? style.color
                    : "#201916"
                }
                onChange={(e) => setStyle({ color: e.target.value })}
              />
              <input
                dir="ltr"
                value={style.color ?? ""}
                placeholder="צבע האתר"
                onChange={(e) => setStyle({ color: e.target.value })}
              />
            </span>
          </label>
          <label>
            יישור
            <select
              value={style.textAlign ?? "inherit"}
              onChange={(e) =>
                setStyle({
                  textAlign: e.target.value as TextStyle["textAlign"],
                })
              }
            >
              <option value="inherit">עיצוב האתר</option>
              <option value="right">ימין</option>
              <option value="center">מרכז</option>
              <option value="left">שמאל</option>
            </select>
          </label>
          <label>
            ריווח בין שורות
            <input
              type="number"
              min="0.7"
              max="3"
              step="0.1"
              value={style.lineHeight ?? ""}
              placeholder="ברירת מחדל"
              onChange={(e) =>
                setStyle({
                  lineHeight: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
            />
          </label>
          <label>
            ריווח בין אותיות
            <span className="number-with-unit">
              <input
                type="number"
                min="-5"
                max="20"
                step="0.5"
                value={style.letterSpacing ?? ""}
                placeholder="ברירת מחדל"
                onChange={(e) =>
                  setStyle({
                    letterSpacing: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
              <span>פיקסלים</span>
            </span>
          </label>
          <button type="button" className="reset-type" onClick={reset}>
            איפוס לעיצוב המקורי
          </button>
        </div>
      </details>
    );
  };
  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    rows = 2,
    styleKey?: string,
  ) => (
    <div className="text-field">
      <label>
        {label}
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
      {styleKey && typographyControl(styleKey)}
    </div>
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
    _accept: string,
    onValue: (v: string) => void,
  ) => (
    <label className="file-field">
      {label}
      <input
        dir="ltr"
        value={value}
        onChange={(e) => onValue(e.target.value)}
      />
    </label>
  );
  const templateChoice = (
    label: string,
    value: string,
    choices: Array<{ value: string; title: string; description: string }>,
    onChange: (value: string) => void,
  ) => (
    <fieldset className="template-picker">
      <legend>{label}</legend>
      <div>
        {choices.map((choice) => (
          <label
            className={value === choice.value ? "selected" : ""}
            key={choice.value}
          >
            <input
              type="radio"
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
            />
            <strong>{choice.title}</strong>
            <span>{choice.description}</span>
          </label>
        ))}
      </div>
    </fieldset>
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
            field(
              `פריט ${i + 1}`,
              item,
              (v) => {
                const a = [...items] as string[];
                a[i] = v;
                update(id, "items", a);
              },
              2,
              `${id}.items.${i}`,
            )
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
              {typographyControl(`${id}.items.${i}.title`)}
              {typographyControl(`${id}.items.${i}.text`)}
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
            `${id}.${key}`,
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
        {id === "events" &&
          templateChoice(
            "צורת התצוגה של הרשימה",
            content.design.eventsTemplate,
            [
              {
                value: "editorial",
                title: "שורות מערכת",
                description: "שורות רחבות, קווי הפרדה ומספור עדין",
              },
              {
                value: "cards",
                title: "כרטיסים רכים",
                description: "פריטים שווים זה לצד זה",
              },
              {
                value: "compact",
                title: "רשימה נקייה",
                description: "תצוגה קצרה וצפופה יותר",
              },
            ],
            (value) =>
              setContent((c) => ({
                ...c,
                design: {
                  ...c.design,
                  eventsTemplate:
                    value as SiteContent["design"]["eventsTemplate"],
                },
              })),
          )}
        {id === "events" && (
          <div className="list-editor event-items-editor">
            <h3>השורות והאייקונים המקוריים</h3>
            {content.events.items.map((item, i) => (
              <div className="list-item-editor" key={`${item.text}-${i}`}>
                <div className="list-item-actions">
                  <button
                    disabled={i === 0}
                    onClick={() => {
                      const a = [...content.events.items];
                      [a[i - 1], a[i]] = [a[i], a[i - 1]];
                      update("events", "items", a);
                    }}
                  >
                    ↑
                  </button>
                  <button
                    disabled={i === content.events.items.length - 1}
                    onClick={() => {
                      const a = [...content.events.items];
                      [a[i + 1], a[i]] = [a[i], a[i + 1]];
                      update("events", "items", a);
                    }}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() =>
                      update(
                        "events",
                        "items",
                        content.events.items.filter((_, n) => n !== i),
                      )
                    }
                  >
                    מחיקה
                  </button>
                </div>
                {field(
                  `שורה ${i + 1}`,
                  item.text,
                  (v) => {
                    const a = [...content.events.items];
                    a[i] = { ...a[i], text: v };
                    update("events", "items", a);
                  },
                  2,
                  `events.items.${i}.text`,
                )}
                <label>
                  קבוצת האייקונים
                  <select
                    value={String(item.iconSet)}
                    onChange={(e) => {
                      const a = [...content.events.items],
                        value = e.target.value;
                      a[i] = {
                        ...a[i],
                        iconSet:
                          value === "none"
                            ? "none"
                            : (Number(value) as 0 | 1 | 2 | 3 | 4),
                      };
                      update("events", "items", a);
                    }}
                  >
                    <option value="0">משפחה ולב משפחתי</option>
                    <option value="1">טבעות וחופה</option>
                    <option value="2">בית וכוסות</option>
                    <option value="3">לחיצת יד ושיחה</option>
                    <option value="4">מעגל, מנחה ומדורה</option>
                    <option value="none">ללא אייקונים</option>
                  </select>
                </label>
                {item.iconSet !== "none" && (
                  <>
                    <div className="event-icon-controls">
                      <label>
                        גודל האייקונים <output>{item.iconSize}%</output>
                        <input
                          type="range"
                          min="60"
                          max="160"
                          step="5"
                          value={item.iconSize}
                          onChange={(e) => {
                            const a = [...content.events.items];
                            a[i] = {
                              ...a[i],
                              iconSize: Number(e.target.value),
                            };
                            update("events", "items", a);
                          }}
                        />
                      </label>
                      <label>
                        מיקום לרוחב{" "}
                        <output>
                          {item.iconX === 0
                            ? "מרכז"
                            : item.iconX > 0
                              ? `${item.iconX} ימינה`
                              : `${Math.abs(item.iconX)} שמאלה`}
                        </output>
                        <input
                          type="range"
                          min="-80"
                          max="80"
                          step="2"
                          value={item.iconX}
                          onChange={(e) => {
                            const a = [...content.events.items];
                            a[i] = { ...a[i], iconX: Number(e.target.value) };
                            update("events", "items", a);
                          }}
                        />
                      </label>
                      <label>
                        מיקום לגובה{" "}
                        <output>
                          {item.iconY === 0
                            ? "מרכז"
                            : item.iconY > 0
                              ? `${item.iconY} למטה`
                              : `${Math.abs(item.iconY)} למעלה`}
                        </output>
                        <input
                          type="range"
                          min="-30"
                          max="30"
                          step="1"
                          value={item.iconY}
                          onChange={(e) => {
                            const a = [...content.events.items];
                            a[i] = { ...a[i], iconY: Number(e.target.value) };
                            update("events", "items", a);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const a = [...content.events.items];
                          a[i] = { ...a[i], iconSize: 100, iconX: 0, iconY: 0 };
                          update("events", "items", a);
                        }}
                      >
                        איפוס גודל ומיקום
                      </button>
                    </div>
                    <div className="event-preview-frame">
                      <div
                        className={`event-icons-preview event-icons-set-${item.iconSet}`}
                        style={{
                          transform: `translate(${item.iconX}px, ${item.iconY}px) scale(${item.iconSize / 100})`,
                        }}
                        aria-label="תצוגת האייקונים"
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
            <button
              className="add-button"
              onClick={() =>
                update("events", "items", [
                  ...content.events.items,
                  {
                    text: "שורה חדשה",
                    iconSet: "none",
                    iconSize: 100,
                    iconX: 0,
                    iconY: 0,
                  },
                ])
              }
            >
              הוספת שורה
            </button>
          </div>
        )}
        {id === "suppliers" && (
          <>
            {field(
              "כותרת אזור הספקים",
              content.food.suppliersTitle,
              (v) => update("food", "suppliersTitle", v),
              2,
              "food.suppliersTitle",
            )}
            {templateChoice(
              "צורת התצוגה של השפים והספקים",
              content.design.suppliersTemplate,
              [
                {
                  value: "cards",
                  title: "כרטיסים שווים",
                  description: "תמונה, שם ושורה קצרה; לחיצה פותחת את התוכן",
                },
                {
                  value: "table",
                  title: "רשימה מפורטת",
                  description: "כל הפרטים והקישורים מוצגים יחד",
                },
              ],
              (value) =>
                setContent((c) => ({
                  ...c,
                  design: {
                    ...c.design,
                    suppliersTemplate:
                      value as SiteContent["design"]["suppliersTemplate"],
                  },
                })),
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
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={s.visible !== false}
                    onChange={(e) => {
                      const a = [...content.food.suppliers];
                      a[i] = { ...a[i], visible: e.target.checked };
                      update("food", "suppliers", a);
                    }}
                  />{" "}
                  הכרטיס מוצג באתר
                </label>
                {(
                  [
                    "name",
                    "owner",
                    "specialty",
                    "fit",
                    "imageAlt",
                    "slug",
                  ] as const
                ).map((k) =>
                  field(
                    {
                      name: "שם הספק",
                      owner: "שם בעלת העסק",
                      specialty: "מה מביאים לשולחן",
                      fit: "מתאים ל־",
                      imageAlt: "תיאור התמונה",
                      slug: "שם קצר לכתובת העמוד (באנגלית)",
                    }[k],
                    s[k],
                    (v) => {
                      const a = [...content.food.suppliers];
                      a[i] = { ...a[i], [k]: v };
                      update("food", "suppliers", a);
                    },
                    2,
                    ["name", "owner", "specialty", "fit"].includes(k)
                      ? `food.suppliers.${i}.${k}`
                      : undefined,
                  ),
                )}
                {fileField("תמונת הספק", s.image, "image/*", (v) => {
                  const a = [...content.food.suppliers];
                  a[i] = { ...a[i], image: v };
                  update("food", "suppliers", a);
                })}
                {mediaControl(`supplier${i}`)}
                {field(
                  "התוכן המלא בעמוד של השף או הספק",
                  s.body,
                  (v) => {
                    const a = [...content.food.suppliers];
                    a[i] = { ...a[i], body: v };
                    update("food", "suppliers", a);
                  },
                  6,
                )}
                <label>
                  מה נפתח בלחיצה על הכרטיס
                  <select
                    value={s.linkMode}
                    onChange={(e) => {
                      const a = [...content.food.suppliers];
                      a[i] = {
                        ...a[i],
                        linkMode: e.target.value as typeof s.linkMode,
                      };
                      update("food", "suppliers", a);
                    }}
                  >
                    <option value="page">עמוד פנימי באתר</option>
                    <option value="external">קישור חיצוני</option>
                    <option value="none">ללא קישור</option>
                  </select>
                </label>
                {s.linkMode === "external" &&
                  field("כתובת הקישור החיצוני", s.link, (v) => {
                    const a = [...content.food.suppliers];
                    a[i] = { ...a[i], link: v };
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
                    visible: true,
                    slug: `supplier-${content.food.suppliers.length + 1}`,
                    body: "",
                    linkMode: "page",
                    link: "",
                    links: [],
                  },
                ])
              }
            >
              הוספת ספק
            </button>
          </>
        )}
        {id === "community" && (
          <>
            {content.community.collections.map(
              (collection, collectionIndex) => (
                <div className="collection-editor" key={collection.id}>
                  <div className="list-item-actions">
                    <button
                      disabled={collectionIndex === 0}
                      onClick={() =>
                        setContent((c) => {
                          const a = [...c.community.collections];
                          [a[collectionIndex - 1], a[collectionIndex]] = [
                            a[collectionIndex],
                            a[collectionIndex - 1],
                          ];
                          return {
                            ...c,
                            community: { ...c.community, collections: a },
                          };
                        })
                      }
                    >
                      ↑
                    </button>
                    <button
                      disabled={
                        collectionIndex ===
                        content.community.collections.length - 1
                      }
                      onClick={() =>
                        setContent((c) => {
                          const a = [...c.community.collections];
                          [a[collectionIndex + 1], a[collectionIndex]] = [
                            a[collectionIndex],
                            a[collectionIndex + 1],
                          ];
                          return {
                            ...c,
                            community: { ...c.community, collections: a },
                          };
                        })
                      }
                    >
                      ↓
                    </button>
                    <button
                      onClick={() =>
                        setContent((c) => ({
                          ...c,
                          community: {
                            ...c.community,
                            collections: c.community.collections.filter(
                              (_, n) => n !== collectionIndex,
                            ),
                          },
                        }))
                      }
                    >
                      מחיקת האוסף
                    </button>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={collection.visible}
                      onChange={(e) =>
                        setContent((c) => {
                          const a = [...c.community.collections];
                          a[collectionIndex] = {
                            ...a[collectionIndex],
                            visible: e.target.checked,
                          };
                          return {
                            ...c,
                            community: { ...c.community, collections: a },
                          };
                        })
                      }
                    />{" "}
                    האוסף מוצג באתר
                  </label>
                  {(
                    [
                      ["kicker", "כותרת קטנה"],
                      ["title", "שם האוסף"],
                      ["description", "תיאור האוסף"],
                    ] as const
                  ).map(([key, label]) =>
                    field(
                      label,
                      collection[key],
                      (v) =>
                        setContent((c) => {
                          const a = [...c.community.collections];
                          a[collectionIndex] = {
                            ...a[collectionIndex],
                            [key]: v,
                          };
                          return {
                            ...c,
                            community: { ...c.community, collections: a },
                          };
                        }),
                      key === "description" ? 3 : 2,
                      `community.collections.${collectionIndex}.${key}`,
                    ),
                  )}
                  {templateChoice(
                    "תבנית הכרטיסים",
                    collection.template,
                    [
                      {
                        value: "square",
                        title: "ריבועים שווים",
                        description: "מתאים לאנשים, משתתפים ונושאים",
                      },
                      {
                        value: "portrait",
                        title: "כרטיסי דיוקן",
                        description: "תמונה אנכית עם שם ותיאור",
                      },
                      {
                        value: "story",
                        title: "כרטיסי סיפור",
                        description: "תמונה רחבה וכותרת בולטת",
                      },
                    ],
                    (value) =>
                      setContent((c) => {
                        const a = [...c.community.collections];
                        a[collectionIndex] = {
                          ...a[collectionIndex],
                          template: value as typeof collection.template,
                        };
                        return {
                          ...c,
                          community: { ...c.community, collections: a },
                        };
                      }),
                  )}
                  <label>
                    מספר כרטיסים בשורה במחשב
                    <select
                      value={collection.columns}
                      onChange={(e) =>
                        setContent((c) => {
                          const a = [...c.community.collections];
                          a[collectionIndex] = {
                            ...a[collectionIndex],
                            columns: Number(e.target.value) as 2 | 3 | 4,
                          };
                          return {
                            ...c,
                            community: { ...c.community, collections: a },
                          };
                        })
                      }
                    >
                      <option value="2">שניים</option>
                      <option value="3">שלושה</option>
                      <option value="4">ארבעה</option>
                    </select>
                  </label>
                  {collection.items.map((item, i) => (
                    <div className="supplier-editor" key={item.id}>
                      <div className="list-item-actions">
                        <button
                          disabled={i === 0}
                          onClick={() =>
                            setContent((c) => {
                              const collections = [...c.community.collections],
                                items = [...collections[collectionIndex].items];
                              [items[i - 1], items[i]] = [
                                items[i],
                                items[i - 1],
                              ];
                              collections[collectionIndex] = {
                                ...collections[collectionIndex],
                                items,
                              };
                              return {
                                ...c,
                                community: { ...c.community, collections },
                              };
                            })
                          }
                        >
                          ↑
                        </button>
                        <button
                          disabled={i === collection.items.length - 1}
                          onClick={() =>
                            setContent((c) => {
                              const collections = [...c.community.collections],
                                items = [...collections[collectionIndex].items];
                              [items[i + 1], items[i]] = [
                                items[i],
                                items[i + 1],
                              ];
                              collections[collectionIndex] = {
                                ...collections[collectionIndex],
                                items,
                              };
                              return {
                                ...c,
                                community: { ...c.community, collections },
                              };
                            })
                          }
                        >
                          ↓
                        </button>
                        <button
                          onClick={() =>
                            setContent((c) => {
                              const collections = [...c.community.collections];
                              collections[collectionIndex] = {
                                ...collections[collectionIndex],
                                items: collections[
                                  collectionIndex
                                ].items.filter((_, n) => n !== i),
                              };
                              return {
                                ...c,
                                community: { ...c.community, collections },
                              };
                            })
                          }
                        >
                          מחיקה
                        </button>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={item.visible}
                          onChange={(e) =>
                            setContent((c) => {
                              const collections = [...c.community.collections],
                                items = [...collections[collectionIndex].items];
                              items[i] = {
                                ...items[i],
                                visible: e.target.checked,
                              };
                              collections[collectionIndex] = {
                                ...collections[collectionIndex],
                                items,
                              };
                              return {
                                ...c,
                                community: { ...c.community, collections },
                              };
                            })
                          }
                        />{" "}
                        הכרטיס מוצג באתר
                      </label>
                      {(
                        [
                          ["title", "כותרת"],
                          ["subtitle", "כותרת משנה"],
                          ["summary", "תקציר"],
                          ["slug", "שם קצר לכתובת העמוד (באנגלית)"],
                          ["imageAlt", "תיאור התמונה"],
                        ] as const
                      ).map(([key, label]) =>
                        field(
                          label,
                          item[key],
                          (v) =>
                            setContent((c) => {
                              const collections = [...c.community.collections],
                                items = [...collections[collectionIndex].items];
                              items[i] = { ...items[i], [key]: v };
                              collections[collectionIndex] = {
                                ...collections[collectionIndex],
                                items,
                              };
                              return {
                                ...c,
                                community: { ...c.community, collections },
                              };
                            }),
                          key === "summary" ? 3 : 2,
                          ["title", "subtitle", "summary"].includes(key)
                            ? `community.collections.${collectionIndex}.items.${i}.${key}`
                            : undefined,
                        ),
                      )}
                      {fileField("תמונת הכרטיס", item.image, "image/*", (v) =>
                        setContent((c) => {
                          const collections = [...c.community.collections],
                            items = [...collections[collectionIndex].items];
                          items[i] = { ...items[i], image: v };
                          collections[collectionIndex] = {
                            ...collections[collectionIndex],
                            items,
                          };
                          return {
                            ...c,
                            community: { ...c.community, collections },
                          };
                        }),
                      )}
                      {mediaControl(`community${collectionIndex}-${i}`)}
                      {field(
                        "התוכן המלא בעמוד",
                        item.body,
                        (v) =>
                          setContent((c) => {
                            const collections = [...c.community.collections],
                              items = [...collections[collectionIndex].items];
                            items[i] = { ...items[i], body: v };
                            collections[collectionIndex] = {
                              ...collections[collectionIndex],
                              items,
                            };
                            return {
                              ...c,
                              community: { ...c.community, collections },
                            };
                          }),
                        7,
                      )}
                      <label>
                        מה נפתח בלחיצה
                        <select
                          value={item.linkMode}
                          onChange={(e) =>
                            setContent((c) => {
                              const collections = [...c.community.collections],
                                items = [...collections[collectionIndex].items];
                              items[i] = {
                                ...items[i],
                                linkMode: e.target
                                  .value as typeof item.linkMode,
                              };
                              collections[collectionIndex] = {
                                ...collections[collectionIndex],
                                items,
                              };
                              return {
                                ...c,
                                community: { ...c.community, collections },
                              };
                            })
                          }
                        >
                          <option value="page">עמוד פנימי באתר</option>
                          <option value="external">קישור חיצוני</option>
                          <option value="none">ללא קישור</option>
                        </select>
                      </label>
                      {item.linkMode === "external" &&
                        field("כתובת הקישור", item.link, (v) =>
                          setContent((c) => {
                            const collections = [...c.community.collections],
                              items = [...collections[collectionIndex].items];
                            items[i] = { ...items[i], link: v };
                            collections[collectionIndex] = {
                              ...collections[collectionIndex],
                              items,
                            };
                            return {
                              ...c,
                              community: { ...c.community, collections },
                            };
                          }),
                        )}
                    </div>
                  ))}
                  <button
                    className="add-button"
                    onClick={() =>
                      setContent((c) => {
                        const collections = [...c.community.collections],
                          items = [
                            ...collections[collectionIndex].items,
                            {
                              id: crypto.randomUUID(),
                              visible: true,
                              title: "כרטיס חדש",
                              subtitle: "",
                              summary: "",
                              image: "",
                              imageAlt: "",
                              slug: `card-${collection.items.length + 1}`,
                              body: "",
                              link: "",
                              linkMode: "page" as const,
                            },
                          ];
                        collections[collectionIndex] = {
                          ...collections[collectionIndex],
                          items,
                        };
                        return {
                          ...c,
                          community: { ...c.community, collections },
                        };
                      })
                    }
                  >
                    הוספת כרטיס לאוסף
                  </button>
                </div>
              ),
            )}
            <button
              className="add-button"
              onClick={() =>
                setContent((c) => ({
                  ...c,
                  community: {
                    ...c.community,
                    collections: [
                      ...c.community.collections,
                      {
                        id: crypto.randomUUID(),
                        visible: true,
                        kicker: "",
                        title: "אוסף חדש",
                        description: "",
                        template: "square",
                        columns: 3,
                        items: [],
                      },
                    ],
                  },
                }))
              }
            >
              הוספת אוסף כרטיסים
            </button>
          </>
        )}
        {id !== "events" &&
          Array.isArray(data.items) &&
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
            {field(
              "שם המותג",
              content.site.brand,
              (v) =>
                setContent((c) => ({ ...c, site: { ...c.site, brand: v } })),
              2,
              "site.brand",
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
                {field(
                  "שם הכפתור",
                  n.label,
                  (v) =>
                    setContent((c) => {
                      const a = [...c.site.navigation];
                      a[i] = { ...a[i], label: v };
                      return { ...c, site: { ...c.site, navigation: a } };
                    }),
                  2,
                  `site.navigation.${i}.label`,
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
            {field(
              "טקסט בתחתית",
              content.site.footerText,
              (v) =>
                setContent((c) => ({
                  ...c,
                  site: { ...c.site, footerText: v },
                })),
              2,
              "site.footerText",
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
            {field(
              "הזמנה לכניסה",
              content.opening.enter,
              (v) =>
                setContent((c) => ({
                  ...c,
                  opening: { ...c.opening, enter: v },
                })),
              2,
              "opening.enter",
            )}
            {field(
              "תחילת השביל",
              content.opening.journeyStart,
              (v) =>
                setContent((c) => ({
                  ...c,
                  opening: { ...c.opening, journeyStart: v },
                })),
              2,
              "opening.journeyStart",
            )}
            {field(
              "מילת החיבור",
              content.opening.journeyBridge,
              (v) =>
                setContent((c) => ({
                  ...c,
                  opening: { ...c.opening, journeyBridge: v },
                })),
              2,
              "opening.journeyBridge",
            )}
            {field(
              "יעד השביל",
              content.opening.journeyArrival,
              (v) =>
                setContent((c) => ({
                  ...c,
                  opening: { ...c.opening, journeyArrival: v },
                })),
              2,
              "opening.journeyArrival",
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
