import Link from "next/link";
import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { StatsBar } from "@/components/landing/stats-bar";
import { Benefits } from "@/components/landing/benefits";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PopularTests } from "@/components/landing/popular-tests";
import { Personas } from "@/components/landing/personas";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Узнай свою генетику.
              <br />
              <span className="text-primary">Управляй здоровьем.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Genesis — генетические тесты с понятной расшифровкой и персональными
              рекомендациями. Более 80 исследований от 1 300 ₽.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/catalog">
                <Button size="lg" className="text-base">
                  Выбрать тест
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="text-base">
                  Как это работает
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        <StatsBar />
        <Benefits />
        <HowItWorks />
        <Suspense fallback={<div className="py-20" />}>
          <PopularTests />
        </Suspense>
        <Personas />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
