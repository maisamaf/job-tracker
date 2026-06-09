import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

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
    default: "JobTrackr | Your job search manager",
    template: "%s | JobTrackr",
  },
  description:
    "Track your job applications and interviews in one place. Stay organized and land your dream job faster.",
  keywords: [
    "job application tracker",
    "job search",
    "interview tracker",
    "career management",
    "application management",
  ],
  authors: [{ name: "JobTrackr" }],
  openGraph: {
    type: "website",
    siteName: "JobTrackr | Your job search manager",
    title: "JobTrackr | Your job search manager",
    description:
      "Track your job applications and interviews in one place. Stay organized and land your dream job faster.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1260,
        height: 630,
        alt: "Job Application Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobTrackr | Your job search manager",
    description:
      "Track your job applications and interviews in one place. Stay organized and land your dream job faster.",
    images: ["/images/og-image.png"],
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
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
