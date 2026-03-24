import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dna, Activity, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Ты — это твои данные.
              <br />
              <span className="text-primary/80">Мы помогаем их читать.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Genesis — персональная система здоровья и долголетия. Генетические
              тесты, биомаркеры и AI-протоколы для осознанного управления своим
              здоровьем.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/catalog">
                <Button size="lg">
                  Каталог тестов
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Узнать больше
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/40 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold tracking-tight">
              Как это работает
            </h2>
            <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Dna className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  1. Выберите тест
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Более 80 генетических тестов: от спортивной генетики до
                  фармакогенетики и онкорисков.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Activity className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  2. Сдайте биоматериал
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Простой забор в лаборатории или на дому. Результат через 14
                  рабочих дней.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  3. Получите результат
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Детальный отчёт с расшифровкой генов, рисков и персональными
                  рекомендациями.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
