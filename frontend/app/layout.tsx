import type { Metadata, Viewport } from "next";
import { gymInfo } from "@data/gym-info";
import "./globals.css";

const title = `${gymInfo.name} | Premium Fitness in Dhahran`;
const description = `${gymInfo.name} is a premium fitness destination in ${gymInfo.location} offering personal training, cycling, aerobics, swimming, and more.`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  name: gymInfo.name,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dhahran",
    addressCountry: "SA",
  },
  telephone: gymInfo.phone,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: gymInfo.rating,
    reviewCount: gymInfo.reviewCount,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-neutral-950 text-white antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
