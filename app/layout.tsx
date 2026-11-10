import type { Metadata } from "next";
import "./globals.css";
import { getSiteContent } from "../lib/content-store";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return { title: content.site.browserTitle, description: content.site.description };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
