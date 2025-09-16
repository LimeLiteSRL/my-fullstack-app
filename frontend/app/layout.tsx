import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Provider from "@/components/provider";
import dynamic from "next/dynamic";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import {
  GOOGLE_ANALYTICS_ID,
  GOOGLE_MAP_API_KEY,
  GOOGLE_TAG_MANAGER_ID,
} from "@/config";
import Script from "next/script";
// Lazy-load heavy third-party scripts only on the client in production
const Hotjar = dynamic(() => import("@/components/hotjar"), { ssr: false });
const ClarityMicrosoft = dynamic(
  () => import("@/components/clarity-microsoft "),
  { ssr: false }
);
const MetaPixel = dynamic(() => import("@/components/meta-pixel"), {
  ssr: false,
});

const inter = Inter({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "arial"],
  preload: true,
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lite Bite | AI health assistant",
  description:
    "LiteBite AI is your friendly and motivational health companion, dedicated to helping you achieve your dietary and lifestyle goals with personalized advice, encouragement, and expert tips.",
  metadataBase: new URL("https://litebite.ai"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      {/* Only inject GTM in production to avoid extra JS during local/dev */}
      {process.env.NODE_ENV === "production" && (
        <GoogleTagManager gtmId={GOOGLE_TAG_MANAGER_ID} />
      )}
      <body
        className={`!mx-auto h-full max-w-2xl bg-neutral-50 !p-0 ${inter.className}`}
      >
        <main className="h-full overflow-x-hidden bg-neutral-50">
          <Provider>{children}</Provider>
        </main>
      </body>
      {process.env.NODE_ENV === "production" && (
        <>
          <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID || ""} />
          <Hotjar />
          <ClarityMicrosoft />
          <MetaPixel />
        </>
      )}
    </html>
  );
}
