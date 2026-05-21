import type { Metadata } from "next";
import "./globals.css";

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
      <body className="font-sans">{children}</body>
    </html>
  );
}
