import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "О нас",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">О Genesis</h1>
      <p className="mt-4 text-muted-foreground">
        Genesis — персональная операционная система здоровья и долголетия.
      </p>
    </div>
  );
}
