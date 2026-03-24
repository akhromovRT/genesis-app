import { createClient } from "@/lib/supabase/server";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { Profile } from "@/types/database";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Пользователи</h1>
      <p className="mt-1 text-muted-foreground">
        {users?.length || 0} зарегистрированных пользователей
      </p>

      <div className="mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Дата регистрации</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(users as Profile[] | null)?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || "—"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.phone || "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "admin" ? "default" : "outline"}
                  >
                    {user.role === "admin" ? "Админ" : "Пользователь"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
