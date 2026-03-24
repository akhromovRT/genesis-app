import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Genesis — Персональная система здоровья и долголетия",
    template: "%s | Genesis",
  },
  description:
    "Генетические тесты, персональные протоколы здоровья и долголетия. Узнайте свою генетику, отслеживайте биомаркеры, получайте AI-рекомендации.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={cn("font-sans", geist.variable)}>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
