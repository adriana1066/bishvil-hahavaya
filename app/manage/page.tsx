import { requireChatGPTUser } from "../chatgpt-auth";
import { getSiteContent } from "../../lib/content-store";
import ManageClient from "./ManageClient";
import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";
export default async function ManagePage() {
  const user = await requireChatGPTUser("/manage");
  if (user.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) return <main className="manage-denied">חדר הניהול פרטי.</main>;
  return <ManageClient initial={await getSiteContent()} />;
}
