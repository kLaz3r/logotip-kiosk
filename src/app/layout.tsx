import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import localFont from "next/font/local";
import { AnimatedLayout } from "~/components/AnimatedLayout";
import { IdleRedirect } from "~/components/IdleRedirect";
import { PWAHandler } from "~/components/PWAHandler";

export const metadata: Metadata = {
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

const futuraPt = localFont({
  variable: "--font-futura-pt",
  src: [
    {
      path: "../../public/fonts/FuturaPT-Book.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/FuturaPT-BookObl.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/FuturaPT-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/FuturaPT-MediumObl.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/FuturaPT-Demi.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/FuturaPT-DemiObl.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/FuturaPT-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/FuturaPT-BoldObl.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/FuturaPT-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/FuturaPT-ExtraBoldObl.ttf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../public/fonts/FuturaPT-Heavy.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/FuturaPT-HeavyObl.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  display: "swap",
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
        <AnimatedLayout>{children}</AnimatedLayout>
      </body>
    </html>
  );
}
