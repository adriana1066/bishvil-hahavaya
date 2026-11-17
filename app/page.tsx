import { getSiteContent } from "../lib/content-store";
import type { SectionId, SiteContent } from "../lib/site-content";
import type { CSSProperties } from "react";
import { Fragment } from "react";
import { ExperienceEntryLink, SilentLoopVideo, StoryVideo } from "./StoryVideo";

export const dynamic = "force-dynamic";

function textStyle(c: SiteContent, key: string): CSSProperties {
  const style = c.textStyles[key] ?? {};
  const families = {
    display: '"Dorian CLM", Georgia, serif',
    sans: 'Arial, "Noto Sans Hebrew", sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
  } as const;
  return {
    fontFamily:
      style.fontFamily && style.fontFamily !== "inherit"
        ? families[style.fontFamily]
        : undefined,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    fontWeight:
      style.fontWeight && style.fontWeight !== "inherit"
        ? Number(style.fontWeight)
        : undefined,
    fontStyle: style.italic ? "italic" : undefined,
    textDecoration: style.underline ? "underline" : undefined,
    color: style.color || undefined,
    textAlign:
      style.textAlign && style.textAlign !== "inherit"
        ? style.textAlign
        : undefined,
    lineHeight: style.lineHeight,
    letterSpacing:
      style.letterSpacing !== undefined
        ? `${style.letterSpacing}px`
        : undefined,
    whiteSpace: "pre-line",
  };
}

function SiteSection({ id, c }: { id: SectionId; c: SiteContent }) {
  if (id === "story") {
    const storyTextParts = c.story.text.split("חיים,");
    const desktopStoryLines =
      c.story.text ===
      "כדי שגם כשהמרחב מתמלא חיים, הוא ימשיך לספר את אותו הסיפור."
        ? [
            "כדי שגם כשהמרחב",
            "מתמלא חיים,",
            "הוא ימשיך לספר",
            "את אותו הסיפור.",
          ]
        : [c.story.text];
    const media = c.mediaSettings.story;
    return (
      <section
        className="story-hero"
        id="story"
        style={
          {
            "--story-eyebrow-size": `${c.story.eyebrowSize}rem`,
            "--story-title-size": `${c.story.titleSize}rem`,
            "--story-title-y": `${c.story.titleY}%`,
            "--story-accent-size": `${c.story.accentSize}rem`,
            "--story-accent-y": `${c.story.accentY}%`,
            "--story-text-size": `${c.story.textSize}rem`,
          } as CSSProperties
        }
      >
        <img
          src={c.story.image}
          alt={c.story.imageAlt}
          style={{
            objectFit: media.fit,
            objectPosition: `${media.x}% ${media.y}%`,
          }}
        />
        <div className="story-shade" />
        <div className="story-copy-right">
          <p className="eyebrow" style={textStyle(c, "story.eyebrow")}>
            {c.story.eyebrow}
          </p>
          <h2>
            <span
              className="story-title-line"
              style={textStyle(c, "story.title")}
            >
              {c.story.title}
            </span>
            <em style={textStyle(c, "story.accent")}>{c.story.accent}</em>
          </h2>
        </div>
        <p className="story-copy-left" style={textStyle(c, "story.text")}>
          <span className="story-text-desktop">
            {desktopStoryLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
          <span className="story-text-mobile">
            <span className="story-text-opening">
              {storyTextParts[0]}
              {storyTextParts.length > 1 ? "חיים," : ""}
            </span>
            {storyTextParts.length > 1 && (
              <span className="story-text-ending">
                {storyTextParts.slice(1).join("חיים,")}
              </span>
            )}
          </span>
        </p>
        <small style={textStyle(c, "story.visionLabel")}>
          {c.story.visionLabel}
        </small>
      </section>
    );
  }
  if (id === "welcome")
    return (
      <section
        className="story-video"
        id="welcome"
        aria-label="הזמנה להיכנס לאירוע"
      >
        <div className="story-video-copy story-video-copy-right">
          <h2 style={textStyle(c, "welcome.title")}>{c.welcome.title}</h2>
        </div>
        <div className="story-video-stage">
          <div
            className="story-video-backdrop"
            style={{ backgroundImage: `url(${c.welcome.image})` }}
            aria-hidden="true"
          />
          <StoryVideo src={c.welcome.video} poster={c.welcome.image} />
        </div>
        <div className="story-video-copy story-video-copy-left">
          <p
            className="story-video-question"
            style={textStyle(c, "welcome.accent")}
          >
            {c.welcome.accent}
          </p>
        </div>
      </section>
    );
  if (id === "recognition")
    return (
      <section className="recognition section" id="top">
        <div className="chapter">01</div>
        <div className="recognition-heading">
          <p className="kicker" style={textStyle(c, "recognition.kicker")}>
            {c.recognition.kicker}
          </p>
          <h2 style={textStyle(c, "recognition.title")}>
            {c.recognition.title}
          </h2>
        </div>
        <div className="recognition-grid">
          <p
            className="recognition-large"
            style={textStyle(c, "recognition.large")}
          >
            {c.recognition.large}
          </p>
          <div className="recognition-details">
            <p style={textStyle(c, "recognition.text1")}>
              {c.recognition.text1}
            </p>
            <p style={textStyle(c, "recognition.text2")}>
              {c.recognition.text2}
            </p>
          </div>
        </div>
      </section>
    );
  if (id === "host")
    return (
      <section className="host-moment">
        <div className="host-video">
          <SilentLoopVideo src={c.host.video} />
        </div>
        <div className="host-copy">
          {c.host.kicker && (
            <p className="kicker light" style={textStyle(c, "host.kicker")}>
              {c.host.kicker}
            </p>
          )}
          <h2 style={textStyle(c, "host.title")}>{c.host.title}</h2>
          <div className="host-text">
            {c.host.text.split("\n\n").map((paragraph, i) => (
              <p key={`${paragraph}-${i}`} style={textStyle(c, "host.text")}>
                {paragraph}
              </p>
            ))}
          </div>
          <blockquote style={textStyle(c, "host.quote")}>
            {c.host.quote}
          </blockquote>
        </div>
      </section>
    );
  if (id === "comparison")
    return (
      <section
        className="comparison-gallery"
        aria-label="אירועים בלי נוצרת ועם נוצרת"
      >
        {c.host.comparison.map((image, index) => {
          const media = c.mediaSettings[`comparison${index}`] ?? {
            x: 50,
            y: 50,
            fit: "cover" as const,
          };
          return (
            <img
              src={image.image}
              alt={image.alt}
              style={{
                objectFit: media.fit,
                objectPosition: `${media.x}% ${media.y}%`,
              }}
              key={`${image.image}-${index}`}
            />
          );
        })}
      </section>
    );
  if (id === "aunt") return <AuntStoryVideo c={c} />;
  if (id === "service") {
    const media = c.mediaSettings.service;
    return (
      <section className="service section" id="service">
        <div className="service-title">
          <div>
            <p className="kicker" style={textStyle(c, "service.kicker")}>
              {c.service.kicker}
            </p>
            <h2 style={textStyle(c, "service.title")}>{c.service.title}</h2>
            <p className="word-origin" style={textStyle(c, "service.origin")}>
              {c.service.origin}
            </p>
          </div>
          <p
            className="service-lead service-lead-right"
            style={textStyle(c, "service.lead")}
          >
            {c.service.lead}
          </p>
        </div>
        <div className="service-portrait">
          <img
            src={c.service.image}
            alt={c.service.imageAlt}
            style={{
              objectFit: media.fit,
              objectPosition: `${media.x}% ${media.y}%`,
            }}
          />
        </div>
        <div className="service-body">
          <p
            className="service-lead service-lead-mobile"
            style={textStyle(c, "service.lead")}
          >
            {c.service.lead}
          </p>
          <div className="service-lines">
            {c.service.items.map((x, i) => (
              <article key={`${x.title}-${i}`}>
                <span style={textStyle(c, `service.items.${i}.title`)}>
                  {x.title}
                </span>
                <p style={textStyle(c, `service.items.${i}.text`)}>{x.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (id === "promise")
    return (
      <section className="promise section">
        <p className="kicker light" style={textStyle(c, "promise.kicker")}>
          {c.promise.kicker}
        </p>
        <h2>
          <span style={textStyle(c, "promise.title")}>{c.promise.title}</span>
          <br />
          <span style={textStyle(c, "promise.accent")}>{c.promise.accent}</span>
        </h2>
        <div className="promise-grid">
          {c.promise.items.map((x, i) => (
            <p key={`${x}-${i}`} style={textStyle(c, `promise.items.${i}`)}>
              {x}
            </p>
          ))}
        </div>
      </section>
    );
  if (id === "events")
    return (
      <section
        className={`events section events-${c.design.eventsTemplate}`}
        id="events"
      >
        <div className="events-heading">
          <p className="kicker" style={textStyle(c, "events.kicker")}>
            {c.events.kicker}
          </p>
          <h2 style={textStyle(c, "events.title")}>{c.events.title}</h2>
        </div>
        <ul className="event-list">
          {c.events.items.map((item, i) => (
            <li key={`${item.text}-${i}`}>
              <span className="event-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <b style={textStyle(c, `events.items.${i}.text`)}>{item.text}</b>
              {item.iconSet !== "none" && (
                <span
                  className={`event-icon-strip event-icons-set-${item.iconSet}`}
                  style={{
                    transform: `translate(${item.iconX}px, ${item.iconY}px) scale(${item.iconSize / 100})`,
                  }}
                  aria-label={
                    {
                      0: "משפחה ולב משפחתי",
                      1: "טבעות וחופה",
                      2: "בית וכוסות",
                      3: "לחיצת יד ושיחה",
                      4: "מעגל אנשים, מנחה ומדורה",
                    }[item.iconSet]
                  }
                />
              )}
            </li>
          ))}
        </ul>
      </section>
    );
  if (id === "food") {
    const media = c.mediaSettings.food;
    return (
      <section className="food section">
        <div className="food-statement">
          <p className="kicker" style={textStyle(c, "food.kicker")}>
            {c.food.kicker}
          </p>
          <h2 style={textStyle(c, "food.title")}>{c.food.title}</h2>
          <img
            className="food-image"
            src={c.food.image}
            alt={c.food.imageAlt}
            width={1672}
            height={941}
            loading="lazy"
            decoding="async"
            style={{
              objectFit: media.fit,
              objectPosition: `${media.x}% ${media.y}%`,
            }}
          />
        </div>
        <div className="food-copy">
          <p style={textStyle(c, "food.text1")}>{c.food.text1}</p>
          <p style={textStyle(c, "food.text2")}>{c.food.text2}</p>
        </div>
      </section>
    );
  }
  if (id === "suppliers") return <VeganSuppliersShowcase c={c} />;
  if (id === "community") return <CardCollectionSection c={c} />;
  if (id === "process")
    return (
      <section className="process section">
        <div className="process-heading">
          <p className="kicker" style={textStyle(c, "process.kicker")}>
            {c.process.kicker}
          </p>
          <h2 style={textStyle(c, "process.title")}>{c.process.title}</h2>
        </div>
        <ol>
          {c.process.items.map((x, i) => (
            <li key={`${x}-${i}`}>
              <b>0{i + 1}</b>
              <span style={textStyle(c, `process.items.${i}`)}>{x}</span>
            </li>
          ))}
        </ol>
      </section>
    );
  return (
    <section className="contact section" id="contact">
      <p className="kicker light" style={textStyle(c, "contact.kicker")}>
        {c.contact.kicker}
      </p>
      <h2 style={textStyle(c, "contact.title")}>{c.contact.title}</h2>
      <a
        className="contact-button"
        style={textStyle(c, "contact.button")}
        href={`https://wa.me/${c.site.whatsappNumber}?text=${encodeURIComponent(c.site.whatsappMessage)}`}
        target="_blank"
        rel="noreferrer"
      >
        {c.contact.button} <span>←</span>
      </a>
      <a
        className="phone"
        style={textStyle(c, "contact.phone")}
        href={`tel:${c.contact.phone.replace(/-/g, "")}`}
      >
        {c.contact.phone}
      </a>
    </section>
  );
}

function VeganSuppliersShowcase({ c }: { c: SiteContent }) {
  const suppliers = c.food.suppliers.filter((s) => s.visible !== false);
  if (c.design.suppliersTemplate === "cards")
    return (
      <section
        className="vegan-suppliers supplier-card-section"
        aria-labelledby="vegan-suppliers-title"
      >
        <div className="vegan-suppliers-heading">
          <h2
            id="vegan-suppliers-title"
            style={textStyle(c, "food.suppliersTitle")}
          >
            {c.food.suppliersTitle}
          </h2>
        </div>
        <div className="supplier-card-grid">
          {suppliers.map((supplier, index) => {
            const href =
              supplier.linkMode === "external"
                ? supplier.link
                : supplier.linkMode === "page"
                  ? `/suppliers/${encodeURIComponent(supplier.slug)}`
                  : "";
            const media = c.mediaSettings[`supplier${index}`] ?? {
              x: 50,
              y: 50,
              fit: "cover" as const,
            };
            const body = (
              <>
                <img
                  src={supplier.image}
                  alt={supplier.imageAlt}
                  style={{
                    objectFit: media.fit,
                    objectPosition: `${media.x}% ${media.y}%`,
                  }}
                />
                <div>
                  <h3 style={textStyle(c, `food.suppliers.${index}.name`)}>
                    {supplier.name}
                  </h3>
                  {supplier.owner && (
                    <p
                      className="supplier-owner"
                      style={textStyle(c, `food.suppliers.${index}.owner`)}
                    >
                      {supplier.owner}
                    </p>
                  )}
                  <p style={textStyle(c, `food.suppliers.${index}.specialty`)}>
                    {supplier.specialty}
                  </p>
                  {supplier.fit && (
                    <small style={textStyle(c, `food.suppliers.${index}.fit`)}>
                      {supplier.fit}
                    </small>
                  )}
                </div>
              </>
            );
            return href ? (
              <a
                className="supplier-card"
                href={href}
                target={supplier.linkMode === "external" ? "_blank" : undefined}
                rel={
                  supplier.linkMode === "external" ? "noreferrer" : undefined
                }
                key={`${supplier.name}-${index}`}
              >
                {body}
              </a>
            ) : (
              <article
                className="supplier-card"
                key={`${supplier.name}-${index}`}
              >
                {body}
              </article>
            );
          })}
        </div>
      </section>
    );
  return (
    <section
      className="vegan-suppliers"
      aria-labelledby="vegan-suppliers-title"
    >
      <div className="vegan-suppliers-heading">
        <h2
          id="vegan-suppliers-title"
          style={textStyle(c, "food.suppliersTitle")}
        >
          {c.food.suppliersTitle}
        </h2>
      </div>
      <div className="suppliers-table" role="table" aria-label="ספקי אוכל">
        <div className="suppliers-table-head" role="row">
          <span role="columnheader">הספק</span>
          <span role="columnheader">מה מביאים לשולחן</span>
          <span role="columnheader">מתאים ל־</span>
          <span role="columnheader">פרטים וקשר</span>
        </div>
        {suppliers.map((supplier, index) => (
          <article
            className="supplier-row"
            role="row"
            key={`${supplier.name}-${index}`}
          >
            <div className="supplier-identity" role="cell">
              <img
                className="supplier-image"
                src={supplier.image}
                alt={supplier.imageAlt}
              />
              <div>
                <h3 style={textStyle(c, `food.suppliers.${index}.name`)}>
                  {supplier.name}
                </h3>
                <p style={textStyle(c, `food.suppliers.${index}.owner`)}>
                  {supplier.owner}
                </p>
              </div>
            </div>
            <p
              className="supplier-specialty"
              role="cell"
              style={textStyle(c, `food.suppliers.${index}.specialty`)}
            >
              <span>מה מביאים לשולחן</span>
              {supplier.specialty}
            </p>
            <p
              className="supplier-fit"
              role="cell"
              style={textStyle(c, `food.suppliers.${index}.fit`)}
            >
              <span>מתאים ל־</span>
              {supplier.fit}
            </p>
            <div className="supplier-links" role="cell">
              <span>פרטים וקשר</span>
              <div>
                {supplier.links.map((link, i) => (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    key={`${link.label}-${i}`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function CardCollectionSection({ c }: { c: SiteContent }) {
  const community = c.community;
  return (
    <section className="community-section" aria-labelledby="community-title">
      <div className="card-collection-heading community-heading">
        <p className="kicker" style={textStyle(c, "community.kicker")}>
          {community.kicker}
        </p>
        <h2 id="community-title" style={textStyle(c, "community.title")}>
          {community.title}
        </h2>
        {community.description && (
          <p style={textStyle(c, "community.description")}>
            {community.description}
          </p>
        )}
      </div>
      {community.collections
        .filter((collection) => collection.visible)
        .map((collection, collectionIndex) => (
          <div
            className={`card-collection card-collection-${collection.template}`}
            style={{ "--card-columns": collection.columns } as CSSProperties}
            key={collection.id}
          >
            <div className="card-collection-heading">
              {collection.kicker && (
                <p
                  className="kicker"
                  style={textStyle(
                    c,
                    `community.collections.${collectionIndex}.kicker`,
                  )}
                >
                  {collection.kicker}
                </p>
              )}
              <h3
                style={textStyle(
                  c,
                  `community.collections.${collectionIndex}.title`,
                )}
              >
                {collection.title}
              </h3>
              {collection.description && (
                <p
                  style={textStyle(
                    c,
                    `community.collections.${collectionIndex}.description`,
                  )}
                >
                  {collection.description}
                </p>
              )}
            </div>
            <div className="card-collection-grid">
              {collection.items
                .filter((item) => item.visible)
                .map((item, index) => {
                  const href =
                    item.linkMode === "external"
                      ? item.link
                      : item.linkMode === "page"
                        ? `/community/${encodeURIComponent(item.slug)}`
                        : "";
                  const media = c.mediaSettings[
                    `community${collectionIndex}-${index}`
                  ] ?? { x: 50, y: 50, fit: "cover" as const };
                  const body = (
                    <>
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        style={{
                          objectFit: media.fit,
                          objectPosition: `${media.x}% ${media.y}%`,
                        }}
                      />
                      <div>
                        <h3
                          style={textStyle(
                            c,
                            `community.collections.${collectionIndex}.items.${index}.title`,
                          )}
                        >
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <p
                            className="card-subtitle"
                            style={textStyle(
                              c,
                              `community.collections.${collectionIndex}.items.${index}.subtitle`,
                            )}
                          >
                            {item.subtitle}
                          </p>
                        )}
                        {item.summary && (
                          <p
                            style={textStyle(
                              c,
                              `community.collections.${collectionIndex}.items.${index}.summary`,
                            )}
                          >
                            {item.summary}
                          </p>
                        )}
                      </div>
                    </>
                  );
                  return href ? (
                    <a
                      className="collection-card"
                      href={href}
                      target={
                        item.linkMode === "external" ? "_blank" : undefined
                      }
                      rel={
                        item.linkMode === "external" ? "noreferrer" : undefined
                      }
                      key={item.id}
                    >
                      {body}
                    </a>
                  ) : (
                    <article className="collection-card" key={item.id}>
                      {body}
                    </article>
                  );
                })}
            </div>
          </div>
        ))}
    </section>
  );
}
function AuntStoryVideo({ c }: { c: SiteContent }) {
  return (
    <section className="aunt-story-video" aria-label={c.host.auntLabel}>
      <div className="aunt-story-video-stage">
        <StoryVideo
          src={c.host.auntVideo}
          poster={c.host.auntPoster}
          loop={false}
        />
      </div>
    </section>
  );
}

export default async function Home() {
  const c = await getSiteContent();
  const whatsapp = `https://wa.me/${c.site.whatsappNumber}?text=${encodeURIComponent(c.site.whatsappMessage)}`;
  const visibleNav = c.site.navigation.filter((item) => item.visible !== false);
  const footerMedia = c.mediaSettings.footer;
  return (
    <main>
      <section
        className="opening-screen opening-screen-approved"
        aria-labelledby="opening-title"
      >
        <h1 className="sr-only" id="opening-title">
          {c.opening.imageAlt}
        </h1>
        <picture className="opening-approved-art">
          <source media="(max-width: 700px)" srcSet={c.opening.mobileImage} />
          <img src={c.opening.desktopImage} alt={c.opening.imageAlt} />
        </picture>
        <p
          className="opening-journey"
          aria-label={`${c.opening.journeyStart} ${c.opening.journeyBridge} ${c.opening.journeyArrival}`}
        >
          <span className="journey-path" aria-hidden="true" />
          <span className="journey-word journey-start">
            <span
              className="journey-glyph"
              style={textStyle(c, "opening.journeyStart")}
            >
              {c.opening.journeyStart}
            </span>
          </span>
          <span className="journey-word journey-bridge">
            <span
              className="journey-glyph"
              style={textStyle(c, "opening.journeyBridge")}
            >
              {c.opening.journeyBridge}
            </span>
          </span>
          <span className="journey-word journey-arrival">
            <span
              className="journey-glyph"
              style={textStyle(c, "opening.journeyArrival")}
            >
              {c.opening.journeyArrival}
            </span>
          </span>
        </p>
        <ExperienceEntryLink
          label={c.opening.enter}
          style={textStyle(c, "opening.enter")}
        />
      </section>
      {c.site.headerVisible && (
        <header className="site-header">
          <a className="brand" href="#top" style={textStyle(c, "site.brand")}>
            {c.site.brand}
          </a>
          {c.site.navigationVisible && (
            <nav>
              {visibleNav.map((item, index) => (
                <a
                  className={
                    index === visibleNav.length - 1 ? "nav-contact" : undefined
                  }
                  style={textStyle(c, `site.navigation.${index}.label`)}
                  href={item.href === "#contact" ? whatsapp : item.href}
                  target={item.href === "#contact" ? "_blank" : undefined}
                  rel={item.href === "#contact" ? "noreferrer" : undefined}
                  key={`${item.href}-${index}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </header>
      )}
      {c.sectionOrder
        .filter((id) => !c.hiddenSections.includes(id))
        .map((id) => (
          <Fragment key={id}>
            <SiteSection id={id} c={c} />
          </Fragment>
        ))}
      {c.site.footerVisible && (
        <footer>
          <img
            className="footer-logo"
            src={c.site.footerImage}
            alt={c.site.footerAlt}
            style={{
              objectFit: footerMedia.fit,
              objectPosition: `${footerMedia.x}% ${footerMedia.y}%`,
            }}
          />
          <p style={textStyle(c, "site.footerText")}>{c.site.footerText}</p>
        </footer>
      )}
    </main>
  );
}
