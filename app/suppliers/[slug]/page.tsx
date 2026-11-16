import { notFound } from "next/navigation";
import Link from "next/link";
import { getSiteContent } from "../../../lib/content-store";

export const dynamic = "force-dynamic";

export default async function SupplierPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const c=await getSiteContent();
  const supplier=c.food.suppliers.find(item=>item.visible!==false&&item.slug===decodeURIComponent(slug));
  if(!supplier) notFound();
  return <main className="content-detail" dir="rtl"><Link className="detail-back" href="/#vegan-suppliers-title">חזרה לספקי האוכל</Link><article><img src={supplier.image} alt={supplier.imageAlt}/><div><p className="kicker">{supplier.owner}</p><h1>{supplier.name}</h1><p className="detail-lead">{supplier.specialty}</p>{supplier.body&&supplier.body.split("\n\n").map(paragraph=><p key={paragraph}>{paragraph}</p>)}{supplier.fit&&<p className="detail-fit">מתאים ל־ {supplier.fit}</p>}<nav className="detail-links">{supplier.links.map((link,index)=><a href={link.href} target="_blank" rel="noreferrer" key={`${link.label}-${index}`}>{link.label}</a>)}</nav></div></article></main>;
}
