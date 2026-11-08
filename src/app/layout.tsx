import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { RegisterSW } from "@/components/pwa/register-sw";
import { LanguageProvider } from "@/components/providers/language-provider";

// Poppins is the typeface on ceda.co.bw.
const inter = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "CEDA Innovation Portal",
  description:
    "Submit, track and fund youth innovation in Botswana: CEDA's idea submission and evaluation portal.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CEDA Ideas",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#3a2a24",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          <LanguageProvider>
            {children}
            <CookieBanner />
            <RegisterSW />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
