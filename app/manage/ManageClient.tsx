"use client";
import { useMemo, useState } from "react";
import type { SectionId, SiteContent } from "../../lib/site-content";
import "./manage.css";

type PanelId = "opening" | SectionId;
const labels: Record<PanelId,string> = {opening:"עמוד הפתיחה",story:"תמונת האירוע",welcome:"הסרטון באירוע",recognition:"הרגע המוכר",host:"המארחת בתוך האירוע",service:"מה עושה נוצרת",promise:"החוויה שנשארת",events:"סוגי אירועים",food:"האוכל באירוע",process:"איך מתחילים",contact:"יצירת קשר"};
const textKeys: Record<SectionId,Array<[string,string]>> = {
  story:[["eyebrow","שורת פתיחה"],["title","כותרת ראשית"],["accent","שורה מודגשת"],["text","טקסט קצר"]],
  welcome:[["eyebrow","שורת פתיחה"],["title","כותרת ראשית"],["accent","שורה מודגשת"],["text","טקסט קצר"]],
  recognition:[["kicker","כותרת קטנה"],["title","כותרת ראשית"],["large","משפט גדול"],["text1","פסקה ראשונה"],["text2","פסקה שנייה"]],
  host:[["kicker","כותרת קטנה"],["title","כותרת ראשית"],["text","הסבר"],["quote","ציטוט"]],
  service:[["kicker","כותרת קטנה"],["title","שם התפקיד"],["origin","פירוש השם"],["lead","פסקת פתיחה"]],
  promise:[["kicker","כותרת קטנה"],["title","כותרת ראשית"],["accent","שורה מודגשת"]],
  events:[["kicker","כותרת קטנה"],["title","כותרת ראשית"]],
  food:[["kicker","כותרת קטנה"],["title","כותרת ראשית"],["text1","פסקה ראשונה"],["text2","פסקה שנייה"]],
  process:[["kicker","כותרת קטנה"],["title","כותרת ראשית"]],
  contact:[["kicker","כותרת קטנה"],["title","כותרת ראשית"],["button","טקסט בכפתור"],["phone","טלפון"]]
};

export default function ManageClient({initial}:{initial:SiteContent}) {
  const [content,setContent] = useState(initial); const [active,setActive] = useState<PanelId>("opening");
  const [status,setStatus] = useState(""); const [busy,setBusy] = useState(false);
  const section = content[active] as unknown as Record<string,unknown>;
  const setSection = (key:string,value:unknown) => setContent(c=>({...c,[active]:{...(c[active] as object),[key]:value}}));
  const move=(id:SectionId,delta:number)=>setContent(c=>{const a=[...c.sectionOrder],i=a.indexOf(id),j=i+delta;if(j<0||j>=a.length)return c;[a[i],a[j]]=[a[j],a[i]];return {...c,sectionOrder:a}});
  const toggle=(id:SectionId)=>setContent(c=>({...c,hiddenSections:c.hiddenSections.includes(id)?c.hiddenSections.filter(x=>x!==id):[...c.hiddenSections,id]}));
  const save=async()=>{setBusy(true);setStatus("שומר...");const r=await fetch("/api/site-content",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify(content)});setStatus(r.ok?"השינויים נשמרו באתר":"השמירה לא הצליחה");setBusy(false)};
  const upload=async(file:File)=>{setBusy(true);setStatus("מעלה תמונה...");const f=new FormData();f.append("file",file);const r=await fetch("/api/uploads",{method:"POST",body:f});const data=await r.json();if(r.ok){setSection("image",data.url);setStatus("התמונה נוספה. לחצי על שמירת השינויים.")}else setStatus(data.error||"העלאה נכשלה");setBusy(false)};
  const previewTitle=useMemo(()=>String(section.title||section.kicker||labels[active]),[section,active]);
  const listKey = Array.isArray(section.items) ? "items" : null;
  return <main className="manager" dir="rtl">
    <header className="manager-head"><div><p>חדר הניהול של אדריאנה הראל</p><h1>עריכת „בשביל ההוויה”</h1></div><div className="manager-actions"><a href="/" target="_blank">צפייה באתר</a><button onClick={save} disabled={busy}>שמירת השינויים</button></div></header>
    <div className="manager-grid">
      <aside className="section-list"><h2>אזורי האתר</h2><div className={active==="opening"?"active":""}><button className="section-name" onClick={()=>setActive("opening")}>עמוד הפתיחה</button></div>{content.sectionOrder.map((id,i)=><div className={active===id?"active":""} key={id}><button className="section-name" onClick={()=>setActive(id)}>{labels[id]}</button><span><button aria-label="למעלה" disabled={i===0} onClick={()=>move(id,-1)}>↑</button><button aria-label="למטה" disabled={i===content.sectionOrder.length-1} onClick={()=>move(id,1)}>↓</button><button className="eye" onClick={()=>toggle(id)}>{content.hiddenSections.includes(id)?"הצגה":"הסתרה"}</button></span></div>)}</aside>
      <section className="editor"><h2>{labels[active]}</h2>{active==="opening" ? <><div className="opening-approved-previews"><figure><figcaption>תצוגת לפטופ</figcaption><img src="/opening-desktop-approved.png" alt="עמוד הפתיחה המאושר בתצוגת לפטופ"/></figure><figure className="opening-mobile-preview"><figcaption>תצוגת אנדרואיד</figcaption><img src="/opening-android-approved.png" alt="עמוד הפתיחה המאושר בתצוגת אנדרואיד"/></figure></div><label>הזמנה לכניסה<textarea value={content.opening.enter} onChange={e=>setSection("enter",e.target.value)}/></label></> : textKeys[active].map(([key,label])=><label key={key}>{label}<textarea rows={String(section[key]||"").length>85?4:2} value={String(section[key]||"")} onChange={e=>setSection(key,e.target.value)}/></label>)}
        {active==="story"&&<div className="type-size-controls"><h3>גודל ומיקום הכתב בלפטופ</h3><label className="range-control"><span>השורה העליונה <output>{content.story.eyebrowSize}</output></span><input type="range" min="1.4" max="3.8" step="0.1" value={content.story.eyebrowSize} onChange={e=>setSection("eyebrowSize",Number(e.target.value))}/></label><label className="range-control"><span>„אירוע שלא רק מתחיל יפה” <output>{content.story.titleSize}</output></span><input type="range" min="3" max="9" step="0.1" value={content.story.titleSize} onChange={e=>setSection("titleSize",Number(e.target.value))}/></label><label className="range-control"><span>גובה „אירוע שלא רק מתחיל יפה” <output>{content.story.titleY}</output></span><input type="range" min="25" max="58" step="0.5" value={content.story.titleY} onChange={e=>setSection("titleY",Number(e.target.value))}/></label><label className="range-control"><span>„אירוע שנשאר” <output>{content.story.accentSize}</output></span><input type="range" min="3" max="9" step="0.1" value={content.story.accentSize} onChange={e=>setSection("accentSize",Number(e.target.value))}/></label><label className="range-control"><span>גובה „אירוע שנשאר” <output>{content.story.accentY}</output></span><input type="range" min="42" max="78" step="0.5" value={content.story.accentY} onChange={e=>setSection("accentY",Number(e.target.value))}/></label><label className="range-control"><span>המשפט בצד שמאל <output>{content.story.textSize}</output></span><input type="range" min="2" max="7" step="0.1" value={content.story.textSize} onChange={e=>setSection("textSize",Number(e.target.value))}/></label></div>}
        {(active==="story"||active==="welcome"||active==="host")&&<label className="upload">תמונת האזור<input type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/><small>אפשר לבחור תמונה מהמחשב או מהטלפון.</small></label>}
        {listKey&&<div className="list-editor"><h3>הרשימה באזור הזה</h3>{(section.items as Array<string|{title:string;text:string}>).map((item,index)=>typeof item==="string"?<label key={index}>פריט {index+1}<textarea value={item} onChange={e=>{const a=[...(section.items as string[])];a[index]=e.target.value;setSection("items",a)}}/></label>:<div className="paired" key={index}><input value={item.title} onChange={e=>{const a=[...(section.items as {title:string;text:string}[])];a[index]={...a[index],title:e.target.value};setSection("items",a)}}/><textarea value={item.text} onChange={e=>{const a=[...(section.items as {title:string;text:string}[])];a[index]={...a[index],text:e.target.value};setSection("items",a)}}/></div>)}</div>}
        <p className="save-status" role="status">{status}</p>
      </section>
      <aside className="mini-preview"><h2>כך התוכן נראה</h2>{(active==="story"||active==="welcome"||active==="host")&&<img src={String(section.image)} alt=""/>}<p>{String(section.kicker||section.eyebrow||"")}</p><h3>{previewTitle}</h3><div>{String(section.text||section.text1||section.lead||section.accent||"")}</div><a href="/" target="_blank">לצפייה מלאה באתר ←</a></aside>
    </div>
  </main>;
}
