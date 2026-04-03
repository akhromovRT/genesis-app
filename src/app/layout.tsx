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
    default: "Genesis — Генетические тесты с персональными рекомендациями",
    template: "%s | Genesis",
  },
  description:
    "Более 80 генетических тестов от 1 300 ₽. Понятная расшифровка, персональные рекомендации, личный кабинет. Спортивная генетика, нутригеномика, фармакогенетика, онкориски.",
  keywords: [
    "генетический тест", "генетика", "ДНК тест", "генетический паспорт",
    "спортивная генетика", "нутригеномика", "фармакогенетика",
    "биохакинг", "здоровье", "долголетие", "Genesis",
  ],
  authors: [{ name: "Genesis" }],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://genesisbio.ru",
    siteName: "Genesis",
    title: "Genesis — Генетические тесты с персональными рекомендациями",
    description: "Более 80 генетических тестов от 1 300 ₽. Понятная расшифровка и персональные рекомендации на основе вашей ДНК.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Genesis — Генетические тесты с персональными рекомендациями",
    description: "Более 80 генетических тестов от 1 300 ₽. Понятная расшифровка и персональные рекомендации.",
  },
  metadataBase: new URL("https://genesisbio.ru"),
  robots: {
    index: true,
    follow: true,
  },
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
