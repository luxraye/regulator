import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { RegisterSW } from "@/components/pwa/register-sw";
import { LanguageProvider } from "@/components/providers/language-provider";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
  themeColor: "#003366",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider session={session}>
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
