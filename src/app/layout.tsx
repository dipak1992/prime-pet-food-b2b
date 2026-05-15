import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Prime Pet Food | Wholesale Portal",
    template: "%s | Prime Pet Food Wholesale",
  },
  description:
    "Prime Pet Food's exclusive B2B wholesale portal. Shop premium pet nutrition — yak cheese chews, natural treats & more — at wholesale prices. Apply for an account today.",
  keywords: [
    "Prime Pet Food",
    "wholesale pet food",
    "B2B pet supplies",
    "yak cheese chews wholesale",
    "natural pet treats wholesale",
    "pet store wholesale",
    "pet food distributor",
  ],
  authors: [{ name: "Prime Pet Food" }],
  creator: "Prime Pet Food",
  publisher: "Prime Pet Food",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://wholesale.primepetfood.com"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Prime Pet Food Wholesale",
    title: "Prime Pet Food | Wholesale Portal",
    description:
      "Exclusive B2B wholesale portal for approved Prime Pet Food retailers. Premium yak cheese chews, natural treats & pet nutrition at wholesale prices.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prime Pet Food — Wholesale Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prime Pet Food | Wholesale Portal",
    description:
      "Exclusive B2B wholesale portal for approved Prime Pet Food retailers.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  robots: {
    index: false, // wholesale portal — keep out of public search
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f8f7f4] text-[#111827]">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
