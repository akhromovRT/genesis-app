import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold">Genesis</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Персональная система здоровья и долголетия. Генетические тесты и
              персонализированные протоколы.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold">Навигация</h4>
            <ul className="mt-3 space-y-2">
              {siteConfig.navigation.main.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-sm font-semibold">Контакты</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href={`mailto:${siteConfig.links.email}`} className="hover:text-foreground">
                  {siteConfig.links.email}
                </a>
              </li>
              <li>
                <a href={`tel:${siteConfig.links.phone}`} className="hover:text-foreground">
                  {siteConfig.links.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Genesis. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
