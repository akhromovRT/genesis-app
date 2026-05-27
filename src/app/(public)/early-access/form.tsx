"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type State = "idle" | "submitting" | "ok" | "error";

export function EarlyAccessForm() {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    mainPain: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "roundtable" }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail =
          data.details?.[0]?.message || data.error || "Не удалось отправить";
        setErrorMsg(detail);
        setState("error");
        return;
      }
      setState("ok");
    } catch (err) {
      console.error(err);
      setErrorMsg("Сеть недоступна. Попробуйте ещё раз.");
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div
        className="rounded-2xl p-8 border border-emerald-700/30 bg-emerald-700/[0.04]"
        role="status"
      >
        <p
          className="text-[0.7rem] mb-3 font-medium tracking-[0.32em] uppercase"
          style={{ color: "#1F6B4A" }}
        >
          Заявка принята
        </p>
        <h3
          className="text-2xl md:text-3xl font-light mb-3 leading-snug"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Спасибо, {form.name.split(" ")[0]}.{" "}
          <em style={{ color: "#1F6B4A", fontStyle: "italic" }}>
            Цена 27 900 ₽ за wellness-трио зафиксирована за вами.
          </em>
        </h3>
        <p className="text-stone-700 leading-relaxed">
          Мы свяжемся в течение 24 часов на указанные email и телефон. Если
          понадобится связаться раньше — пишите на{" "}
          <a
            className="underline"
            style={{ color: "#1F6B4A" }}
            href="mailto:hello@genesisbio.ru"
          >
            hello@genesisbio.ru
          </a>
          .
        </p>
      </div>
    );
  }

  const disabled = state === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ea-name">Имя</Label>
          <Input
            id="ea-name"
            type="text"
            required
            placeholder="Как к вам обращаться"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ea-email">Email</Label>
          <Input
            id="ea-email"
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ea-phone">Телефон</Label>
        <Input
          id="ea-phone"
          type="tel"
          required
          placeholder="+7 ___ ___ __ __"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ea-pain">
          Главная боль{" "}
          <span className="text-stone-400 font-normal text-xs">
            (что сильнее всего волнует — кратко)
          </span>
        </Label>
        <Textarea
          id="ea-pain"
          rows={3}
          placeholder="Например: вес уходит и возвращается, нет энергии, кожа реагирует на всё подряд…"
          value={form.mainPain}
          onChange={(e) => update("mainPain", e.target.value)}
          disabled={disabled}
        />
      </div>

      {state === "error" && (
        <div className="rounded-md border border-red-200 bg-red-50/60 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          disabled={disabled}
          size="lg"
          className="w-full md:w-auto text-base"
          style={{ background: "#1F6B4A" }}
        >
          {disabled ? "Отправляем…" : "Зафиксировать цену 27 900 ₽"}
        </Button>
        <p className="text-xs text-stone-500 mt-3">
          Отправляя заявку, вы соглашаетесь на обработку контактных данных в
          целях связи. Не передаём третьим лицам.
        </p>
      </div>
    </form>
  );
}
