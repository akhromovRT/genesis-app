const TELEGRAM_API = "https://api.telegram.org";

type SendOptions = {
  chatId: string;
  text: string;
  parseMode?: "HTML" | "MarkdownV2";
};

async function sendMessage({ chatId, text, parseMode = "HTML" }: SendOptions) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Telegram sendMessage failed (${res.status}): ${errText}`);
  }
  return res.json();
}

export type LeadPayload = {
  name: string;
  email: string;
  phone: string;
  mainPain: string;
  source: string;
};

export function formatLeadMessage(lead: LeadPayload) {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const pain = lead.mainPain.trim() || "—";
  return [
    "<b>🌿 Новый Early Access лид</b>",
    "",
    `<b>Имя:</b> ${esc(lead.name)}`,
    `<b>Email:</b> ${esc(lead.email)}`,
    `<b>Телефон:</b> ${esc(lead.phone || "—")}`,
    `<b>Главная боль:</b> ${esc(pain)}`,
    "",
    `<i>Источник: ${esc(lead.source)}</i>`,
  ].join("\n");
}

export async function notifyLead(lead: LeadPayload) {
  const raw = process.env.TELEGRAM_NOTIFY_CHAT_IDS || "";
  const chatIds = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (chatIds.length === 0) {
    console.warn(
      "[telegram] TELEGRAM_NOTIFY_CHAT_IDS is empty — skipping notification"
    );
    return { delivered: 0 };
  }

  const text = formatLeadMessage(lead);
  const results = await Promise.allSettled(
    chatIds.map((chatId) => sendMessage({ chatId, text }))
  );

  const delivered = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected");
  failed.forEach((r) => {
    if (r.status === "rejected") console.error("[telegram]", r.reason);
  });

  return { delivered, failed: failed.length };
}

export async function getUpdates() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  const res = await fetch(`${TELEGRAM_API}/bot${token}/getUpdates`, {
    cache: "no-store",
  });
  return res.json();
}
