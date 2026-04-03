import type { MetadataRoute } from "next";
import { db } from "@/db";
import { tests, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://genesisbio.ru";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/catalog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/calculator`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contacts`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  // Dynamic test pages
  const allTests = await db.select({
    slug: tests.slug,
    updatedAt: tests.updatedAt,
  }).from(tests).where(eq(tests.isActive, true));

  const testPages: MetadataRoute.Sitemap = allTests.map((t) => ({
    url: `${BASE_URL}/catalog/${t.slug}`,
    lastModified: t.updatedAt ?? new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Category filter pages
  const allCategories = await db.select({
    slug: categories.slug,
  }).from(categories).where(eq(categories.isActive, true));

  const categoryPages: MetadataRoute.Sitemap = allCategories.map((c) => ({
    url: `${BASE_URL}/catalog?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...testPages, ...categoryPages];
}
