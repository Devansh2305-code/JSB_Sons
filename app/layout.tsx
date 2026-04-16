import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSB Sons — Premium Clothing Store",
  description: "JSB Sons — Your trusted clothing destination. Shop premium clothing with seamless ordering and delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
