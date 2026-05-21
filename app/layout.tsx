import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Click Suporte — Assistência Técnica Premium em Sorriso-MT",
  description: "Suporte técnico sem enrolação e sem espera. Atendimento remoto e presencial em até 2 horas com garantia de 30 dias.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
