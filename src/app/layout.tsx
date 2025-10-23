import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import localFont from "next/font/local";
import { IdleRedirect } from "~/components/IdleRedirect";
import { PWAHandler } from "~/components/PWAHandler";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  ),
  title: "Logotip Kiosk",
  description: "Kiosk for local print shop",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/icon0.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/icon1.png", type: "image/png" },
    { rel: "apple-touch-icon", url: "/apple-icon.png" },
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Logotip",
  },
  applicationName: "Logotip Kiosk",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Optimized: Only load essential font weights (400, 600) to reduce initial bundle size
const futuraPt = localFont({
  variable: "--font-futura-pt",
  src: [
    {
      path: "../../public/fonts/FuturaPT-Book.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/FuturaPT-Demi.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/FuturaPT-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" className={futuraPt.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Logotip" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <style>{`
          /* Lock to landscape orientation */
          @media screen and (orientation: portrait) {
            body::before {
              content: "Please rotate your device to landscape mode";
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: #000;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              text-align: center;
              z-index: 9999;
              padding: 20px;
            }
            body > *:not(style) {
              display: none !important;
            }
          }
          /* Fullscreen styles */
          html, body {
            overflow: hidden;
            position: fixed;
            width: 100%;
            height: 100%;
            overscroll-behavior: none;
          }
          /* Prevent pull-to-refresh */
          body {
            overscroll-behavior-y: contain;
          }
        `}</style>
      </head>
      <body>
        <PWAHandler />
        <IdleRedirect />
        {children}
      </body>
    </html>
  );
}
