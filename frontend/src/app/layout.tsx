import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FullCut - Edite vídeos automaticamente",
  description:
    "Remova silêncios, pausas e filler words dos seus vídeos automaticamente. Transforme vídeos longos em conteúdo curto e dinâmico.",
  openGraph: {
    title: "FullCut - Edite vídeos automaticamente",
    description:
      "Remova silêncios, pausas e filler words dos seus vídeos automaticamente.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
