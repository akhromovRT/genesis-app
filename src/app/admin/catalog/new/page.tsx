import { createClient } from "@/lib/supabase/server";
import { TestForm } from "@/components/admin/test-form";
import type { Category } from "@/types/database";

export default async function NewTestPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">
        Добавить тест
      </h1>
      <TestForm categories={(categories as Category[]) || []} />
    </div>
  );
}
