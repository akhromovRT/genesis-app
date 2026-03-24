import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TestForm } from "@/components/admin/test-form";
import type { Category, Test } from "@/types/database";

interface EditTestPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestPage({ params }: EditTestPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: test } = await supabase
    .from("tests")
    .select("*")
    .eq("id", id)
    .single();

  if (!test) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight">
        Редактировать тест
      </h1>
      <TestForm
        categories={(categories as Category[]) || []}
        initialData={test as Test}
      />
    </div>
  );
}
