import "~/styles/globals.css";

import { type Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import { AnimatedLayout } from "~/components/AnimatedLayout";
import { IdleRedirect } from "~/components/IdleRedirect";

export const metadata: Metadata = {
  title: "Logotip Kiosk",
  description: "Kiosk for local print shop",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" className={`${futuraPt.variable} ${montserrat.variable}`}>
      <body>
        <IdleRedirect />
        <AnimatedLayout>{children}</AnimatedLayout>
      </body>
    </html>
  );
}
