import type { Metadata } from "next";
import "./globals.css";
<<<<<<< HEAD
import { SessionProvider } from "next-auth/react";
=======
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c

export const metadata: Metadata = {
  title: "Farovon Awards — Корпоративная премия",
  description: "Ежегодная корпоративная премия признания лучших сотрудников компании Farovon Group.",
};

<<<<<<< HEAD
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
=======
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
>>>>>>> ea0ea528935b3fb349231e765b4381c98866c16c
    </html>
  );
}
