import { notFound } from "next/navigation";
import Link from "next/link";
import { getSiteContent } from "../../../lib/content-store";

export const dynamic = "force-dynamic";

export default async function CommunityPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const c=await getSiteContent();
  const item=c.community.collections.flatMap(collection=>collection.visible?collection.items:[]).find(card=>card.visible&&card.slug===decodeURIComponent(slug));
  if(!item) notFound();
  return <main className="content-detail" dir="rtl"><Link className="detail-back" href="/#community-title">חזרה לקהילה</Link><article><img src={item.image} alt={item.imageAlt}/><div><p className="kicker">{item.subtitle}</p><h1>{item.title}</h1>{item.summary&&<p className="detail-lead">{item.summary}</p>}{item.body.split("\n\n").filter(Boolean).map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div></article></main>;
}
