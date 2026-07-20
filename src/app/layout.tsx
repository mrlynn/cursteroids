import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConsoleGreeting from "@/components/ConsoleGreeting";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Includes the multi-zone base path: file-convention OG image URLs compose
  // from metadataBase without the basePath prefix, so it must live here.
  // www is the canonical host — the apex 308s to it, and unfurl crawlers
  // shouldn't have to follow a redirect to fetch the OG image.
  metadataBase: new URL("https://www.mlynn.org/cursteroids"),
  title: "Cursteroids — the job description you can play",
  description:
    "Cursor is hiring an AI Adoption Engineer. Play the job: clear adoption blockers, accept Tab suggestions, deploy agents on the toil, keep Trust alive. Then prove it with a real artifact.",
  openGraph: {
    title: "Cursteroids — the job description you can play",
    description:
      "Cursor is hiring an AI Adoption Engineer. Ninety seconds of play, one real artifact. Which builder are you?",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursteroids — the job description you can play",
    description:
      "Cursor is hiring an AI Adoption Engineer. Ninety seconds of play, one real artifact. Which builder are you?",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ConsoleGreeting />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
