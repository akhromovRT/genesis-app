/**
 * Форматирование цены из копеек в рубли.
 * formatPrice(4180000) -> "41 800 ₽"
 */
export function formatPrice(priceInKopecks: number): string {
  const rubles = priceInKopecks / 100;
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rubles);
}

/**
 * Цена для ЮKassa API (строка с двумя десятичными).
 * toYookassaAmount(4180000) -> "41800.00"
 */
export function toYookassaAmount(priceInKopecks: number): string {
  return (priceInKopecks / 100).toFixed(2);
}

/**
 * Форматирование даты на русском.
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Форматирование даты с временем.
 */
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Склонение слова по числительному.
 * pluralize(5, "маркер", "маркера", "маркеров") -> "5 маркеров"
 */
export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 19) return `${count} ${many}`;
  if (mod10 === 1) return `${count} ${one}`;
  if (mod10 >= 2 && mod10 <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
}
