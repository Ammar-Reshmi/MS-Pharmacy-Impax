import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { default: "MS Pharma Impex | Pharmaceutical Supply", template: "%s | MS Pharma Impex" },
  description: "Professional B2B pharmaceutical catalogue and quotation platform.",
  robots: { index: false, follow: false }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <body className="min-h-screen font-sans antialiased">
        <SiteHeader />

        <main>{children}</main>

        <SiteFooter />
      </body>
    </html>
  );
}