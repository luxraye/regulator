import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { RegisterSW } from "@/components/pwa/register-sw";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BOCRA - Botswana Communications Regulatory Authority",
  description:
    "Modern digital platform for regulatory compliance, licensing, and stakeholder engagement.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BOCRA",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1628",
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
          {children}
          <CookieBanner />
          <RegisterSW />
        </SessionProvider>
      </body>
    </html>
  );
}
