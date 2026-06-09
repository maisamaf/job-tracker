import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JobTrackr — Your job search, finally organised",
  description:
    "Track every application, contact, and interview in one place. Generate tailored cover letters with AI in seconds.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
