import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { CartBadge } from "@/components/cart/cart-badge";
import { UserNav } from "@/components/layout/user-nav";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          Genesis
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {siteConfig.navigation.main.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <CartBadge />
          {user ? (
            <UserNav user={user} />
          ) : (
            <Link href="/login">
              <Button size="sm">Войти</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
