"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { LogOut, Package, FileText, Settings } from "lucide-react";

function getInitials(email: string): string {
  return email.charAt(0).toUpperCase();
}

export function UserNav({ user }: { user: User }) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent">
        <Avatar className="h-9 w-9">
          <AvatarFallback>{getInitials(user.email || "U")}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="text-sm font-medium">
              {user.user_metadata?.full_name || "Пользователь"}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/orders")}>
          <Package className="mr-2 h-4 w-4" />
          Мои заказы
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/results")}>
          <FileText className="mr-2 h-4 w-4" />
          Результаты
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
          <Settings className="mr-2 h-4 w-4" />
          Профиль
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
