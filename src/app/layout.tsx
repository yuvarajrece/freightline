import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/bricolage-grotesque";
import "./globals.css";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Freightline", template: "%s | Freightline" },
};

export const viewport: Viewport = {
  themeColor: "#07162b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
