import { getSiteContent } from "../lib/content-store";
import type { SectionId, SiteContent } from "../lib/site-content";
import type { CSSProperties } from "react";
import { Fragment } from "react";
import { ExperienceEntryLink, SilentLoopVideo, StoryVideo } from "./StoryVideo";

export const dynamic = "force-dynamic";
const whatsapp = "https://wa.me/972546550816?text=%D7%A9%D7%9C%D7%95%D7%9D%20%D7%90%D7%93%D7%A8%D7%99%D7%90%D7%A0%D7%94%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%95%D7%93%20%D7%A2%D7%9C%20%D7%A9%D7%99%D7%A8%D7%95%D7%AA%20%D7%A0%D7%A6%D7%99%D7%A8%D7%AA%20%D7%9E%D7%A8%D7%97%D7%91%20%D7%94%D7%90%D7%99%D7%A8%D7%95%D7%97";

function SiteSection({id,c}:{id:SectionId,c:SiteContent}) {
  if(id==="story") {
    const storyTextParts=c.story.text.split("חיים,");
    const desktopStoryLines=c.story.text==="כדי שגם כשהמרחב מתמלא חיים, הוא ימשיך לספר את אותו הסיפור."?["כדי שגם כשהמרחב","מתמלא חיים,","הוא ימשיך לספר","את אותו הסיפור."]:[c.story.text];
    return <section className="story-hero" id="story" style={{"--story-eyebrow-size":`${c.story.eyebrowSize}rem`,"--story-title-size":`${c.story.titleSize}rem`,"--story-title-y":`${c.story.titleY}%`,"--story-accent-size":`${c.story.accentSize}rem`,"--story-accent-y":`${c.story.accentY}%`,"--story-text-size":`${c.story.textSize}rem`} as CSSProperties}><img src={c.story.image} alt="הדמיה של מרחב אירוח עשיר, חי ומזמין"/><div className="story-shade"/><div className="story-copy-right"><p className="eyebrow">{c.story.eyebrow}</p><h2><span className="story-title-line">{c.story.title}</span><em>{c.story.accent}</em></h2></div><p className="story-copy-left"><span className="story-text-desktop">{desktopStoryLines.map(line=><span key={line}>{line}</span>)}</span><span className="story-text-mobile"><span className="story-text-opening">{storyTextParts[0]}{storyTextParts.length>1?"חיים,":""}</span>{storyTextParts.length>1&&<span className="story-text-ending">{storyTextParts.slice(1).join("חיים,")}</span>}</span></p><small>הדמיית חזון</small></section>;
  }
  if(id==="welcome") return <section className="story-video" id="welcome" aria-label="הזמנה להיכנס לאירוע"><div className="story-video-copy story-video-copy-right"><h2>{c.welcome.title}</h2></div><div className="story-video-stage"><div className="story-video-backdrop" style={{backgroundImage:`url(${c.welcome.image})`}} aria-hidden="true"/><StoryVideo poster={c.welcome.image}/></div><div className="story-video-copy story-video-copy-left"><p className="story-video-question">{c.welcome.accent}</p></div></section>;
  if(id==="recognition") return <section className="recognition section" id="top"><div className="chapter">01</div><div className="recognition-heading"><p className="kicker">{c.recognition.kicker}</p><h2>{c.recognition.title}</h2></div><div className="recognition-grid"><p className="recognition-large">{c.recognition.large}</p><div className="recognition-details"><p>{c.recognition.text1}</p><p>{c.recognition.text2}</p></div></div></section>;
  if(id==="host") return <section className="host-moment"><div className="host-video"><SilentLoopVideo src="/host-event-loop.mp4"/></div><div className="host-copy">{c.host.kicker&&<p className="kicker light">{c.host.kicker}</p>}<h2>{c.host.title}</h2><div className="host-text">{c.host.text.split("\n\n").map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div><blockquote>{c.host.quote}</blockquote></div></section>;
  if(id==="service") return <section className="service section" id="service"><div className="service-title"><div><p className="kicker">{c.service.kicker}</p><h2>{c.service.title}</h2><p className="word-origin">{c.service.origin}</p></div><p className="service-lead service-lead-right">{c.service.lead}</p></div><div className="service-portrait"><img src="/adriana-yellow.jpg" alt="אדריאנה הראל בשמלה צהובה בתוך אירוע"/></div><div className="service-body"><p className="service-lead service-lead-mobile">{c.service.lead}</p><div className="service-lines">{c.service.items.map(x=><article key={x.title}><span>{x.title}</span><p>{x.text}</p></article>)}</div></div></section>;
  if(id==="promise") return <section className="promise section"><p className="kicker light">{c.promise.kicker}</p><h2>{c.promise.title}<br/><span>{c.promise.accent}</span></h2><div className="promise-grid">{c.promise.items.map(x=><p key={x}>{x}</p>)}</div></section>;
  if(id==="events") return <section className="events section" id="events"><div className="events-heading"><p className="kicker">{c.events.kicker}</p><h2>{c.events.title}</h2></div><ul className="event-list">{c.events.items.map((x,i)=><li key={x}><span>0{i+1}</span>{x}</li>)}</ul></section>;
  if(id==="food") return <section className="food section"><div className="food-statement"><p className="kicker">{c.food.kicker}</p><h2>{c.food.title}</h2><img className="food-image" src="/culinary-table.jpg" alt="שולחן אירוח עשיר עם מאפים, סלטים, פירות, עוגות ומשקאות" width={1672} height={941} loading="lazy" decoding="async"/></div><div className="food-copy"><p>{c.food.text1}</p><p>{c.food.text2}</p></div></section>;
  if(id==="process") return <section className="process section"><div className="process-heading"><p className="kicker">{c.process.kicker}</p><h2>{c.process.title}</h2></div><ol>{c.process.items.map((x,i)=><li key={x}><b>0{i+1}</b><span>{x}</span></li>)}</ol></section>;
  return <section className="contact section" id="contact"><p className="kicker light">{c.contact.kicker}</p><h2>{c.contact.title}</h2><a className="contact-button" href={whatsapp} target="_blank" rel="noreferrer">{c.contact.button} <span>←</span></a><a className="phone" href={`tel:${c.contact.phone.replace(/-/g,"")}`}>{c.contact.phone}</a></section>;
}

function VeganSuppliersShowcase() {
  return <section className="vegan-suppliers" aria-labelledby="vegan-suppliers-title">
    <div className="vegan-suppliers-heading">
      <h2 id="vegan-suppliers-title">ספקי אוכל שאני שמחה לחבר אל האירוע שלכם</h2>
    </div>
    <div className="suppliers-table" role="table" aria-label="ספקי אוכל">
      <div className="suppliers-table-head" role="row">
        <span role="columnheader">הספק</span><span role="columnheader">מה מביאים לשולחן</span><span role="columnheader">מתאים ל־</span><span role="columnheader">פרטים וקשר</span>
      </div>
      <article className="supplier-row" role="row">
        <div className="supplier-identity" role="cell">
          <img className="supplier-image" src="/niva-mango-cake.jpg" alt="עוגת מנגו טבעונית של ניבה בנטו"/>
          <div><h3>ניבה בנטו</h3><p>ניבה קרן־אור</p></div>
        </div>
        <p className="supplier-specialty" role="cell"><span>מה מביאים לשולחן</span>קולינריה טבעונית צבעונית, נדיבה ומלאת דמיון.</p>
        <p className="supplier-fit" role="cell"><span>מתאים ל־</span>קינוחים · אירוח קטן</p>
        <div className="supplier-links" role="cell"><span>פרטים וקשר</span><div>
            <a href="https://nivabento.com/" target="_blank" rel="noreferrer">אתר</a>
            <a href="https://www.instagram.com/niva.bento/" target="_blank" rel="noreferrer">אינסטגרם</a>
            <a href="https://www.facebook.com/niva.bento/" target="_blank" rel="noreferrer">פייסבוק</a>
            <a href="https://www.tiktok.com/@nivabento" target="_blank" rel="noreferrer">טיקטוק</a>
        </div></div>
      </article>
    </div>
  </section>;
}

export default async function Home() {
  const c=await getSiteContent();
  return <main><section className="opening-screen opening-screen-approved" aria-labelledby="opening-title"><h1 className="sr-only" id="opening-title">נוצרת מרחבי אירוח — בשביל ההוויה</h1><picture className="opening-approved-art"><source media="(max-width: 700px)" srcSet="/opening-android-approved.png"/><img src="/opening-desktop-approved.png" alt="נוצרת מרחבי אירוח — בשביל ההוויה"/></picture><p className="opening-journey" aria-label="השביל אל האירוח החדש"><span className="journey-path" aria-hidden="true"/><span className="journey-word journey-start"><span className="journey-glyph">השביל</span></span><span className="journey-word journey-bridge"><span className="journey-glyph">אל</span></span><span className="journey-word journey-arrival"><span className="journey-glyph">האירוח החדש</span></span></p><ExperienceEntryLink label={c.opening.enter}/></section><header className="site-header"><a className="brand" href="#top">בשביל ההוויה</a><nav><a href="#story">החוויה</a><a href="#service">נוצרת</a><a href="#events">למי מתאים</a><a className="nav-contact" href={whatsapp} target="_blank" rel="noreferrer">נדבר על האירוע</a></nav></header>{c.sectionOrder.filter(id=>!c.hiddenSections.includes(id)).map(id=><Fragment key={id}><SiteSection id={id} c={c}/>{id==="host"&&<section className="comparison-gallery" aria-label="אירועים בלי נוצרת ועם נוצרת"><img src="/comparison-host.png" alt="מארחת מטפלת בעמדת הקפה לעומת מארחת הפנויה לאורחות"/><img src="/comparison-evening.png" alt="מארח מסדר את שולחן הכיבוד לעומת מארח הפנוי לאורחים"/><img src="/comparison-garden.jpg" alt="אורחת מטפלת בשולחן לעומת אורחת הפנויה לשיחה"/><img src="/comparison-business.jpg" alt="מארח מטפל בעמדת הקפה לעומת מארח הפנוי לשיחה"/></section>}{id==="food"&&<VeganSuppliersShowcase/>}</Fragment>)}<footer><img className="footer-logo" src="/footer-logo.jpg" alt="בשביל ההוויה"/><p>אדריאנה הראל · נוצרת מרחבי אירוח</p></footer></main>;
}
