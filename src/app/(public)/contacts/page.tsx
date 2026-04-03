import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с Genesis — email, форма обратной связи.",
};

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Свяжитесь с нами</h1>
      <p className="mt-3 text-muted-foreground">
        Есть вопрос по тестам, результатам или сотрудничеству? Напишите нам.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {/* Email card */}
        <Card className="border-0 bg-primary/5 shadow-none md:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mt-4 font-semibold">Email</h2>
            <a
              href="mailto:hello@genesisbio.ru"
              className="mt-1 text-sm text-primary hover:underline"
            >
              hello@genesisbio.ru
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              Обычно отвечаем в течение 24 часов
            </p>
          </CardContent>
        </Card>

        {/* Contact form */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h2 className="font-semibold">Форма обратной связи</h2>
            <form
              action="mailto:hello@genesisbio.ru"
              method="POST"
              encType="text/plain"
              className="mt-4 space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input id="name" name="name" placeholder="Как вас зовут?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Сообщение</Label>
                <Textarea id="message" name="message" placeholder="Ваш вопрос или предложение" rows={4} required />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Отправить
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
