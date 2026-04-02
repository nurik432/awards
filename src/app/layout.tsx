import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farovon Awards — Корпоративная премия",
  description: "Ежегодная корпоративная премия признания лучших сотрудников компании Farovon Group.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
