import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snake Leader",
  description: "A premium multiplayer Snakes and Ladders game",
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
