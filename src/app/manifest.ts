import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prime Pet Food Wholesale Portal",
    short_name: "Prime Pet",
    description:
      "Wholesale portal for approved Prime Pet Food retailers.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f7f4",
    theme_color: "#ea580c",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
