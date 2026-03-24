import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Package, FileText, Settings } from "lucide-react";

const icons: Record<string, React.ElementType> = {
  "/dashboard/orders": Package,
  "/dashboard/results": FileText,
  "/dashboard/profile": Settings,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/40 p-6 md:block">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Genesis
        </Link>
        <nav className="mt-8 space-y-1">
          {siteConfig.navigation.dashboard.map((item) => {
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
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
