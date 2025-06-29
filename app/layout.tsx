// app/layout.tsx (Server Component)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://vetconnect.rw'),
  title: "VetConnect - Connecting Farmers with Veterinarians",
  description: "A simple and reliable platform for domestic animal owners to request veterinary support and manage health records in Rwanda.",
  keywords: ["veterinary", "farmers", "animal health", "Rwanda", "vet appointments", "livestock"],
  authors: [{ name: "VetConnect Team" }],
  creator: "VetConnect",
  publisher: "VetConnect",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "VetConnect - Veterinary & Farmer Support Platform",
    description: "Connect with qualified veterinarians, manage animal health records, and book appointments easily.",
    url: "https://vetconnect.rw",
    siteName: "VetConnect",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VetConnect Platform",
      },
    ],
    locale: "en_US",
    alternateLocale: "rw_RW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VetConnect - Veterinary & Farmer Support",
    description: "Connect farmers with veterinarians easily in Rwanda",
    images: ["/twitter-image.png"],
    creator: "@vetconnect_rw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#40925b",
      },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://vetconnect.rw",
    languages: {
      "en-US": "https://vetconnect.rw/en",
      "rw-RW": "https://vetconnect.rw/rw",
    },
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Bootstrap Icons CDN */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.min.css"
        />
        {/* Additional meta tags */}
        <meta name="theme-color" content="#40925b" />
        <meta name="msapplication-TileColor" content="#40925b" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-700 text-white px-4 py-2 rounded-md z-50">
          Skip to main content
        </a>
        
        <ClientLayout>
          {children}
        </ClientLayout>
        
        {/* Noscript fallback */}
        <noscript>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 text-center">
            Please enable JavaScript to use all features of VetConnect.
          </div>
        </noscript>
      </body>
    </html>
  );
}