import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Контакты",
};

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Контакты</h1>
      <div className="mt-8 space-y-4">
        <p>
          <strong>Email:</strong>{" "}
          <a href={`mailto:${siteConfig.links.email}`} className="text-primary hover:underline">
            {siteConfig.links.email}
          </a>
        </p>
        <p>
          <strong>Телефон:</strong>{" "}
          <a href={`tel:${siteConfig.links.phone}`} className="text-primary hover:underline">
            {siteConfig.links.phone}
          </a>
        </p>
      </div>
    </div>
  );
}
