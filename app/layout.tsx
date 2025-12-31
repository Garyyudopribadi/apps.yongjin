import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@app/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PT.YONGJIN JAVASUKA GARMENT",
  description: "Dev by Garyyudo",
  keywords: ["YJ", "YONGJIN", "PT.YONGJIN JAVASUKA GARMENT", "Gary Yudo Pribadi"],
  authors: [{ name: "Dev Garyudo" }],
  icons: {
    icon: "/icons/icon-128x128.png",
  },
  openGraph: {
    title: "YONGJIN",
    description: "Dev By Garyyudo",
    url: "apps.yongjin.space",
    siteName: "Yongjin App",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yongjin App",
    description: "Dev By Garyyudo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
