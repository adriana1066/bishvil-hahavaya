import { redirect } from "next/navigation";
import { getSiteContent } from "../../lib/content-store";
import { hasAdminSession } from "../../lib/admin-auth";
import ManageClient from "./ManageClient";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  if (!(await hasAdminSession())) redirect("/manage/login");
  return <ManageClient initial={await getSiteContent()} />;
}
