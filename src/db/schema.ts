import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ── Profiles ──────────────────────────────────────────────────
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").default(""),
  phone: text("phone").default(""),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ── Categories ────────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").default(""),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_categories_slug").on(table.slug),
]);

// ── Tests ─────────────────────────────────────────────────────
export const tests = pgTable("tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id").notNull().references(() => categories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  code: text("code").default(""),
  price: integer("price").notNull(),
  description: text("description").default(""),
  fullDescription: text("full_description").default(""),
  markersCount: integer("markers_count"),
  turnaroundDays: integer("turnaround_days"),
  biomaterial: text("biomaterial").default(""),
  isActive: boolean("is_active").default(true),
  isPopular: boolean("is_popular").default(false),
  imageUrl: text("image_url"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_tests_category_id").on(table.categoryId),
  index("idx_tests_slug").on(table.slug),
  index("idx_tests_is_active").on(table.isActive),
]);

// ── Orders ────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique().default(sql`generate_order_number()`),
  userId: uuid("user_id").references(() => profiles.id),
  status: text("status").notNull().default("pending"),
  totalAmount: integer("total_amount").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").default(""),
  notes: text("notes").default(""),
  paymentId: text("payment_id"),
  paymentStatus: text("payment_status"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_orders_user_id").on(table.userId),
  index("idx_orders_order_number").on(table.orderNumber),
  index("idx_orders_status").on(table.status),
]);

// ── Order Items ───────────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  testId: uuid("test_id").notNull().references(() => tests.id),
  testName: text("test_name").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_order_items_order_id").on(table.orderId),
]);

// ── Order Status History ──────────────────────────────────────
export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  changedBy: uuid("changed_by").references(() => profiles.id),
  comment: text("comment").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Test Results ──────────────────────────────────────────────
export const testResults = pgTable("test_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  orderItemId: uuid("order_item_id").references(() => orderItems.id),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  description: text("description").default(""),
  uploadedBy: uuid("uploaded_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_test_results_user_id").on(table.userId),
  index("idx_test_results_order_id").on(table.orderId),
]);

// ── Cart Items ────────────────────────────────────────────────
export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  testId: uuid("test_id").notNull().references(() => tests.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex("cart_items_user_test_unique").on(table.userId, table.testId),
  index("idx_cart_items_user_id").on(table.userId),
]);

// ── DNA Reports ───────────────────────────────────────────────
export const dnaReports = pgTable("dna_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  lab: text("lab").notNull().default("cerbalab"),
  patientName: text("patient_name").notNull(),
  birthDate: text("birth_date"),
  sex: text("sex"),
  sampleType: text("sample_type"),
  sampleNumber: text("sample_number"),
  sampleDate: text("sample_date"),
  resultDate: text("result_date"),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  fullText: text("full_text"),
  markersCount: integer("markers_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  index("idx_dna_reports_user_id").on(table.userId),
]);

// ── DNA Markers ───────────────────────────────────────────────
export const dnaMarkers = pgTable("dna_markers", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").notNull().references(() => dnaReports.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  gene: text("gene").notNull(),
  rsid: text("rsid").notNull().default(""),
  genotype: text("genotype").notNull(),
}, (table) => [
  index("idx_dna_markers_report_id").on(table.reportId),
  index("idx_dna_markers_gene").on(table.gene),
  index("idx_dna_markers_rsid").on(table.rsid),
]);
