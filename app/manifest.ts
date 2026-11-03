import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "בשביל ההוויה",
    short_name: "בשביל ההוויה",
    description: "נוצרת מרחבי אירוח",
    start_url: "/",
    display: "standalone",
    background_color: "#5d0033",
    theme_color: "#5d0033",
    lang: "he",
    dir: "rtl",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
