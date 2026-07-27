import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import { CategoryThemeProvider } from "@/providers/theme-provider"
import { CartProvider } from "@/context/cart-context";
import { QueryProvider } from "@/providers/query-provider";
import CartDrawer from "@/components/cart/CartDrawer";
import { Toaster } from "sonner";
import { DEFAULT_SITE_DESCRIPTION, SITE_NAME, absoluteUrl, getSiteUrl } from "@/lib/seo";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next"
import { Outfit } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import { DeliveryAddressProvider } from "@/context/DeliveryAddressContext";
import { SyncPendingAddress } from "@/components/SyncPendingAddress";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),

  applicationName: SITE_NAME,

  title: {
    default: `${SITE_NAME} | Accessories, Gadgets, Electronics,  Solar, Phones, Computers, Machines, IOT, and more`,
    template: `%s | ${SITE_NAME}`,
  },

  description: DEFAULT_SITE_DESCRIPTION,

  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
    shortcut: ["/favicon.ico"],
  },

  manifest: "/site.webmanifest",

  keywords: [
    "truevenix",
    "electronics store", "gadgets", "solar panels", "rexi", "Itel", "inverters",
    "Banex Plaza","Abuja","Power banks", "oraimo","New age",
    "phones","smartphones","laptops","computers", "accessories",
    "earphones","headphones","chargers","cables","laptop bags",
    "smartwatches", "Online Shopping", "Online Store", "E-commerce", "Electronics Store", "Gadgets Store",
    "Electicity", "Solar Energy", "Solar Panels", "Inverters", "Batteries", "Generators", "Power Solutions",
    "Felicity",
    "deye", "solar Batterys",
    "solar inverters",
    "solar panels",
    "solar solutions",
    "solar energy",
    "solar power systems",
    "Solar Generator",
    "solar products",
    "solar equipment",
    "solar installation",
    "solar maintenance",
    "solar services",
    "solar technology",
    "Nigeria electronics",
  ],

  alternates: {
    canonical: absoluteUrl("/"),
  },

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Electronics, Gadgets, Solar, Phones & Computers`,
    description: DEFAULT_SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    images: [
      {
        url: absoluteUrl("/logo.svg"),
        width: 1200,
        height: 630,
        alt: "TrueVenix Electronics Store",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Electronics, Gadgets, Solar, Phones & Computers`,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [absoluteUrl("/logo.svg")],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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
      className={`${geistSans.variable} ${outfit.variable} ${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >

      <body className="min-h-full flex flex-col">
          
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "truevenix",
      url: absoluteUrl("/"),
      logo: absoluteUrl("/logo.svg"),
       sameAs: [
         "https://www.instagram.com/truevenix",
         "https://www.facebook.com/61590595359794",
      ],
    }),
  }}
/>
       <Analytics />
        <QueryProvider>
          <CategoryThemeProvider>
            <SessionProvider>
            <CartProvider>
              <CartDrawer />
               <DeliveryAddressProvider>
                <SyncPendingAddress />
              <ClientBody>
                {children}</ClientBody>
              </DeliveryAddressProvider>
              <Toaster richColors position="top-right" />
            </CartProvider>
            </SessionProvider>
          </CategoryThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
