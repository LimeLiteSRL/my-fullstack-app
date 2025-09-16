import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lite Bite",
    short_name: "liteBite",
    description:
      "Lite Bite AI is your friendly and motivational health companion, dedicated to helping you achieve your dietary and lifestyle goals with personalized advice, encouragement, and expert tips.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#4E56D3",
    icons: [
      // {
      //   src: "/icon.png",
      //   sizes: "any",
      //   type: "image/png",
      // },
    ],
  };
}
