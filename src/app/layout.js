import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  let faviconUrl = '/api/favicon';
  try {
    const settings = await prisma.settings.findFirst();
    faviconUrl += "?v=" + (settings?.updatedAt ? new Date(settings.updatedAt).getTime() : Date.now());
  } catch (e) {
    console.error("Failed to load settings for metadata:", e);
  }

  return {
    title: "Ashtavinayak Flyash Bricks - Eco-Friendly Construction Solutions",
    description: "Premium quality flyash bricks manufactured by Ashtavinayak Flyash Bricks. Durable, eco-friendly, and cost-effective building materials.",
    keywords: "flyash bricks, ash bricks, construction materials, eco-friendly bricks, Ashtavinayak",
    robots: "index, follow",
    icons: {
      icon: faviconUrl
    },
    verification: {
      google: 'az-auINiEX7dSWJ8OXbk_lFvQZcoHLNSA8T4VLve2hE',
    }
  };
}

import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
