import { db } from "@/db";
import { tests } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export { formatPrice } from "@/lib/format";

export interface BlockSubblock {
  title: string;
  pains: string[];
}

export interface ProductBlock {
  id: string;
  slug: string;
  name: string;
  code: string;
  painHeadline: string;
  description: string;
  fullDescription: string;
  price: number;
  markersCount: number | null;
  consultationHours: number;
  subblocks: BlockSubblock[];
  isPopular: boolean;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface ProductPackage {
  id: string;
  slug: string;
  name: string;
  code: string;
  description: string;
  fullDescription: string;
  price: number;
  compareAtPrice: number | null;
  includedBlockSlugs: string[];
  giftBlockSlug: string | null;
  consultationHours: number;
  isPopular: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
}

export function calculateSavings(price: number, compareAtPrice: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return compareAtPrice - price;
}

export function calculateSavingsPercent(price: number, compareAtPrice: number | null): number {
  const savings = calculateSavings(price, compareAtPrice);
  if (savings === 0 || !compareAtPrice) return 0;
  return Math.round((savings / compareAtPrice) * 100);
}

export async function getActiveBlocks(): Promise<ProductBlock[]> {
  const rows = await db
    .select()
    .from(tests)
    .where(and(eq(tests.productType, "block"), eq(tests.isActive, true)))
    .orderBy(asc(tests.price), asc(tests.code));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    code: r.code ?? "",
    painHeadline: r.painHeadline ?? "",
    description: r.description ?? "",
    fullDescription: r.fullDescription ?? "",
    price: r.price,
    markersCount: r.markersCount ?? null,
    consultationHours: r.consultationHours ?? 0,
    subblocks: (r.subblocks as BlockSubblock[] | null) ?? [],
    isPopular: r.isPopular ?? false,
    imageUrl: r.imageUrl,
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
  }));
}

export async function getActivePackages(): Promise<ProductPackage[]> {
  const rows = await db
    .select()
    .from(tests)
    .where(and(eq(tests.productType, "package"), eq(tests.isActive, true)))
    .orderBy(asc(tests.price));
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    code: r.code ?? "",
    description: r.description ?? "",
    fullDescription: r.fullDescription ?? "",
    price: r.price,
    compareAtPrice: r.compareAtPrice ?? null,
    includedBlockSlugs: (r.includedBlockSlugs as string[] | null) ?? [],
    giftBlockSlug: r.giftBlockSlug,
    consultationHours: r.consultationHours ?? 0,
    isPopular: r.isPopular ?? false,
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
  }));
}

export async function getBlockBySlug(slug: string): Promise<ProductBlock | null> {
  const blocks = await getActiveBlocks();
  return blocks.find((b) => b.slug === slug) ?? null;
}

export async function getPackageBySlug(slug: string): Promise<ProductPackage | null> {
  const pkgs = await getActivePackages();
  return pkgs.find((p) => p.slug === slug) ?? null;
}

/** Поштучный якорь — сумма цен всех активных блоков. Не SKU, а виртуальный compareAt. */
export function calculateAnchorPrice(blocks: ProductBlock[]): number {
  return blocks.reduce((sum, b) => sum + b.price, 0);
}
