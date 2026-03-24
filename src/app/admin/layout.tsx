import Link from "next/link";
import { siteConfig } from "@/config/site";
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  FolderTree,
  FileText,
  Users,
} from "lucide-react";

const icons: Record<string, React.ElementType> = {
  "/admin": LayoutDashboard,
  "/admin/orders": Package,
  "/admin/catalog": FlaskConical,
  "/admin/categories": FolderTree,
  "/admin/results": FileText,
  "/admin/users": Users,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r bg-muted/40 p-6 md:block">
        <Link href="/admin" className="text-xl font-bold tracking-tight">
          Genesis <span className="text-xs font-normal text-muted-foreground">Admin</span>
        </Link>
        <nav className="mt-8 space-y-1">
          {siteConfig.navigation.admin.map((item) => {
            const Icon = icons[item.href] || Package;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-8">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            &larr; На сайт
          </Link>
        </div>
      </aside>
      <div className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
