import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "בשביל ההוויה | נוֹצֶרֶת מרחבי אירוח",
  description:
    "ניהול ותפעול מרחבי אירוח בזמן ההגשה, כדי שהנראות, השפע, הסדר והתחושה יישמרו לאורך האירוע כולו.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
