export const siteConfig = {
  name: "Genesis",
  description:
    "Персональная система здоровья и долголетия. Генетические тесты, биомаркеры, AI-протоколы.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    telegram: "https://t.me/genesis_health",
    email: "info@genesis-health.ru",
    phone: "+7 (800) 000-00-00",
  },
  navigation: {
    main: [
      { title: "Каталог тестов", href: "/catalog" },
      { title: "О нас", href: "/about" },
      { title: "Контакты", href: "/contacts" },
    ],
    dashboard: [
      { title: "Мои заказы", href: "/dashboard/orders" },
      { title: "Результаты", href: "/dashboard/results" },
      { title: "Профиль", href: "/dashboard/profile" },
    ],
    admin: [
      { title: "Дашборд", href: "/admin" },
      { title: "Заказы", href: "/admin/orders" },
      { title: "Каталог", href: "/admin/catalog" },
      { title: "Категории", href: "/admin/categories" },
      { title: "Результаты", href: "/admin/results" },
      { title: "Пользователи", href: "/admin/users" },
    ],
  },
} as const;

export const ORDER_STATUSES = {
  pending: { label: "Ожидает оплаты", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Оплачен", color: "bg-blue-100 text-blue-800" },
  processing: { label: "В работе", color: "bg-purple-100 text-purple-800" },
  ready: { label: "Результат готов", color: "bg-green-100 text-green-800" },
  completed: { label: "Завершён", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "Отменён", color: "bg-red-100 text-red-800" },
  refunded: { label: "Возврат", color: "bg-orange-100 text-orange-800" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;
