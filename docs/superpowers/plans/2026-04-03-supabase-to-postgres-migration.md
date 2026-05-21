# Supabase → PostgreSQL Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Supabase (auth + DB + storage) with self-hosted PostgreSQL + Drizzle ORM + custom JWT auth + local file storage.

**Architecture:** Next.js 16 app connects to PostgreSQL 16 on same Docker network via Drizzle ORM. Auth uses bcrypt + JWT in HttpOnly cookies. File uploads go to a Docker volume.

**Tech Stack:** Drizzle ORM, postgres (porsager), jose, bcryptjs

**Spec:** `docs/superpowers/specs/2026-04-03-supabase-to-postgres-migration-design.md`

---

### Task 1: Install Dependencies & Update Config

**Files:**
- Modify: `package.json`
- Create: `drizzle.config.ts`
- Modify: `.env.local`

- [ ] **Step 1: Install new dependencies**

```bash
cd "/Users/akhromov/Library/Mobile Documents/com~apple~CloudDocs/Cursor/@work-projects/genesis-app"
npm install drizzle-orm postgres jose bcryptjs
npm install -D drizzle-kit @types/bcryptjs
npm uninstall @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Create drizzle.config.ts**

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 3: Update .env.local**

Replace the Supabase env vars with:

```
# Database
DATABASE_URL=postgresql://pass24:8134cb20109a053c55369ac6e232f1d0@localhost:5432/genesis

# Auth
JWT_SECRET=genesis-dev-jwt-secret-change-in-production-must-be-64-chars!!

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Note: `localhost` for local dev; on server it will be `pass24-postgres` (Docker container name).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json drizzle.config.ts .env.local
git commit -m "chore: replace supabase deps with drizzle, jose, bcryptjs"
```

---

### Task 2: Database Schema

**Files:**
- Create: `src/db/schema.ts`

- [ ] **Step 1: Create src/db/schema.ts**

```typescript
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
  orderNumber: text("order_number").notNull().unique(),
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
```

- [ ] **Step 2: Commit**

```bash
git add src/db/schema.ts
git commit -m "feat: add Drizzle ORM schema for all tables"
```

---

### Task 3: Database Client & SQL Migration

**Files:**
- Create: `src/db/index.ts`
- Create: `drizzle/0001_init.sql`

- [ ] **Step 1: Create src/db/index.ts**

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
```

Note: `prepare: false` is required for Next.js edge compatibility and connection pooling.

- [ ] **Step 2: Create drizzle/0001_init.sql**

This is the SQL migration that creates all tables. Run `npx drizzle-kit generate` to auto-generate it from the schema, OR create manually:

```bash
mkdir -p drizzle
npx drizzle-kit generate
```

After generation, verify the SQL file exists in `drizzle/` and contains CREATE TABLE statements for all 8 tables. Also manually add the order number sequence and updated_at trigger function to the generated file:

Append to the generated migration file:

```sql
-- Order number sequence
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
  SELECT 'GEN-' || lpad(nextval('order_number_seq')::text, 6, '0');
$$ LANGUAGE sql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Set order_number default
ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT generate_order_number();
```

- [ ] **Step 3: Commit**

```bash
git add src/db/index.ts drizzle/
git commit -m "feat: add Drizzle client and SQL migration"
```

---

### Task 4: Auth Library

**Files:**
- Create: `src/lib/auth.ts`

- [ ] **Step 1: Create src/lib/auth.ts**

```typescript
import { SignJWT, jwtVerify } from "jose";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "genesis-token";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const JWT_EXPIRES_IN = "7d";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

// ── JWT ───────────────────────────────────────────────────────

export async function signToken(user: AuthUser): Promise<string> {
  return new SignJWT({ sub: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRES_IN)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

// ── Password ──────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return compare(password, hashed);
}

// ── Cookie helpers ────────────────────────────────────────────

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ── Server-side user retrieval ────────────────────────────────

export async function getUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Forbidden");
  return user;
}

// ── Profile helpers ───────────────────────────────────────────

export async function getUserProfile(userId: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  return profile ?? null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: add JWT auth library with bcrypt + jose"
```

---

### Task 5: Auth API Routes

**Files:**
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`

- [ ] **Step 1: Create POST /api/auth/register**

```typescript
// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  fullName: z.string().min(1, "Введите имя"),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if email already exists
    const [existing] = await db.select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, data.email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);

    const [user] = await db.insert(profiles).values({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone || "",
      role: "user",
    }).returning();

    const token = await signToken({ id: user.id, email: user.email, role: user.role! });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, fullName: user.fullName },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Ошибка регистрации" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create POST /api/auth/login**

```typescript
// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const [user] = await db.select()
      .from(profiles)
      .where(eq(profiles.email, data.email))
      .limit(1);

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
    }

    const token = await signToken({ id: user.id, email: user.email, role: user.role! });
    await setAuthCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, fullName: user.fullName },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Проверьте введённые данные" }, { status: 400 });
    }
    console.error("Login error:", error);
    return NextResponse.json({ error: "Ошибка входа" }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create POST /api/auth/logout**

```typescript
// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Delete old OAuth callback route**

Delete `src/app/api/auth/callback/route.ts` (was for Supabase OAuth).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/auth/
git commit -m "feat: add auth API routes (register, login, logout)"
```

---

### Task 6: Middleware

**Files:**
- Rewrite: `src/middleware.ts`
- Delete: `src/lib/supabase/middleware.ts`

- [ ] **Step 1: Rewrite src/middleware.ts**

Replace the entire file:

```typescript
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "genesis-token";
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getTokenPayload(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { sub: string; role: string; email: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const user = await getTokenPayload(request);

  // Protect /dashboard — require auth
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Protect /admin — require auth + admin role
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/dashboard/orders", request.url));
  }

  // Pass user info to server components via headers
  const response = NextResponse.next();
  if (user) {
    response.headers.set("x-user-id", user.sub);
    response.headers.set("x-user-role", user.role);
    response.headers.set("x-user-email", user.email);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: replace Supabase middleware with JWT validation"
```

---

### Task 7: Layout Components (Header + UserNav)

**Files:**
- Rewrite: `src/components/layout/header.tsx`
- Rewrite: `src/components/layout/user-nav.tsx`

- [ ] **Step 1: Rewrite header.tsx**

Replace the entire file. Key change: use `getUser()` from auth library instead of Supabase.

```typescript
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { CartBadge } from "@/components/cart/cart-badge";
import { UserNav } from "@/components/layout/user-nav";
import { getUser } from "@/lib/auth";

export async function Header() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Genesis
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {siteConfig.navigation.main.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <CartBadge />
          {user ? (
            <UserNav user={user} />
          ) : (
            <Link href="/login">
              <Button size="sm">Войти</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Rewrite user-nav.tsx**

Replace the entire file. Key change: call `/api/auth/logout` instead of Supabase signOut. Accept `AuthUser` instead of Supabase `User`.

```typescript
"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Package, FileText, Settings } from "lucide-react";
import type { AuthUser } from "@/lib/auth";

export function UserNav({ user }: { user: AuthUser }) {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent">
        <Avatar className="h-9 w-9">
          <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/header.tsx src/components/layout/user-nav.tsx
git commit -m "feat: update header and user-nav to use JWT auth"
```

---

### Task 8: Auth Forms (Login, Register, Password Pages)

**Files:**
- Rewrite: `src/components/auth/login-form.tsx`
- Rewrite: `src/components/auth/register-form.tsx`
- Rewrite: `src/app/(auth)/forgot-password/page.tsx`
- Rewrite: `src/app/(auth)/reset-password/page.tsx`

- [ ] **Step 1: Rewrite login-form.tsx**

Key change: POST to `/api/auth/login` instead of Supabase `signInWithPassword`.

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ошибка входа");
      setLoading(false);
      return;
    }

    router.push("/dashboard/orders");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Вход в аккаунт</CardTitle>
        <CardDescription>
          Введите email и пароль для входа в личный кабинет
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```

- [ ] **Step 2: Rewrite register-form.tsx**

Key change: POST to `/api/auth/register` instead of Supabase `signUp`. No email confirmation step — login immediately.

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, phone }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Ошибка регистрации");
      setLoading(false);
      return;
    }

    router.push("/dashboard/orders");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>
          Создайте аккаунт, чтобы заказывать тесты и отслеживать результаты
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">Имя и фамилия</Label>
            <Input id="fullName" placeholder="Иван Иванов" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" type="tel" placeholder="+7 (999) 123-45-67" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" placeholder="Минимум 6 символов" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-primary hover:underline">Войти</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```

- [ ] **Step 3: Simplify forgot-password page (disabled for MVP)**

Replace `src/app/(auth)/forgot-password/page.tsx` — no email sending, just show a message:

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Восстановление пароля</CardTitle>
        <CardDescription>
          Для сброса пароля обратитесь к администратору по email:
          info@genesis-health.ru
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href="/login" className="w-full">
          <Button variant="outline" className="w-full">
            Вернуться к входу
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 4: Simplify reset-password page (disabled for MVP)**

Replace `src/app/(auth)/reset-password/page.tsx`:

```typescript
import { redirect } from "next/navigation";

export default function ResetPasswordPage() {
  redirect("/forgot-password");
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/ src/app/\(auth\)/
git commit -m "feat: update auth forms to use custom JWT API"
```

---

### Task 9: Public Pages (Catalog + Test Detail)

**Files:**
- Rewrite: `src/app/(public)/catalog/page.tsx`
- Rewrite: `src/app/(public)/catalog/[slug]/page.tsx`

- [ ] **Step 1: Rewrite catalog page**

Replace all Supabase queries with Drizzle. Key changes: `import { db } from "@/db"` and Drizzle query syntax.

```typescript
import type { Metadata } from "next";
import { db } from "@/db";
import { tests, categories } from "@/db/schema";
import { eq, and, ilike, asc, desc } from "drizzle-orm";
import { TestCard } from "@/components/catalog/test-card";
import { CategoryFilter } from "@/components/catalog/category-filter";
import { SearchBar } from "@/components/catalog/search-bar";
import type { Category, TestWithCategory } from "@/types/database";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Каталог генетических тестов",
  description: "Более 80 генетических тестов: спортивная генетика, онкология, фармакогенетика, питание и красота. Цены от 1 300 ₽.",
};

interface CatalogPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  // Fetch categories
  const allCategories = await db.select().from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder));

  // Build conditions
  const conditions = [eq(tests.isActive, true)];

  if (params.category) {
    const cat = allCategories.find((c) => c.slug === params.category);
    if (cat) conditions.push(eq(tests.categoryId, cat.id));
  }

  if (params.q) {
    conditions.push(ilike(tests.name, `%${params.q}%`));
  }

  // Fetch tests with categories
  const allTests = await db.select({
    id: tests.id, categoryId: tests.categoryId, name: tests.name, slug: tests.slug,
    code: tests.code, price: tests.price, description: tests.description,
    fullDescription: tests.fullDescription, markersCount: tests.markersCount,
    turnaroundDays: tests.turnaroundDays, biomaterial: tests.biomaterial,
    isActive: tests.isActive, isPopular: tests.isPopular, imageUrl: tests.imageUrl,
    metaTitle: tests.metaTitle, metaDescription: tests.metaDescription,
    createdAt: tests.createdAt, updatedAt: tests.updatedAt,
    categories: {
      id: categories.id, name: categories.name, slug: categories.slug,
      description: categories.description, sortOrder: categories.sortOrder,
      isActive: categories.isActive, imageUrl: categories.imageUrl,
      createdAt: categories.createdAt, updatedAt: categories.updatedAt,
    },
  })
    .from(tests)
    .leftJoin(categories, eq(tests.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(tests.isPopular), asc(tests.price));

  // Map to expected types (snake_case for the UI components)
  const mappedCategories: Category[] = allCategories.map((c) => ({
    id: c.id, name: c.name, slug: c.slug, description: c.description ?? "",
    sort_order: c.sortOrder ?? 0, is_active: c.isActive ?? true,
    image_url: c.imageUrl, created_at: c.createdAt?.toISOString() ?? "",
    updated_at: c.updatedAt?.toISOString() ?? "",
  }));

  const mappedTests: TestWithCategory[] = allTests.map((t) => ({
    id: t.id, category_id: t.categoryId, name: t.name, slug: t.slug,
    code: t.code ?? "", price: t.price, description: t.description ?? "",
    full_description: t.fullDescription ?? "", markers_count: t.markersCount,
    turnaround_days: t.turnaroundDays, biomaterial: t.biomaterial ?? "",
    is_active: t.isActive ?? true, is_popular: t.isPopular ?? false,
    image_url: t.imageUrl, meta_title: t.metaTitle, meta_description: t.metaDescription,
    created_at: t.createdAt?.toISOString() ?? "", updated_at: t.updatedAt?.toISOString() ?? "",
    categories: {
      id: t.categories?.id ?? "", name: t.categories?.name ?? "",
      slug: t.categories?.slug ?? "", description: t.categories?.description ?? "",
      sort_order: t.categories?.sortOrder ?? 0, is_active: t.categories?.isActive ?? true,
      image_url: t.categories?.imageUrl ?? null,
      created_at: t.categories?.createdAt?.toISOString() ?? "",
      updated_at: t.categories?.updatedAt?.toISOString() ?? "",
    },
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Каталог генетических тестов</h1>
        <p className="mt-2 text-muted-foreground">
          Более 80 исследований от лаборатории CERBALAB. Результат через 14–30 рабочих дней.
        </p>
      </div>
      <div className="mb-8 space-y-4">
        <Suspense><SearchBar /></Suspense>
        <Suspense><CategoryFilter categories={mappedCategories} /></Suspense>
      </div>
      {mappedTests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mappedTests.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            {params.q || params.category ? "Тестов по вашему запросу не найдено" : "Каталог тестов загружается..."}
          </p>
        </div>
      )}
      {mappedTests.length > 0 && (
        <p className="mt-8 text-center text-sm text-muted-foreground">Найдено тестов: {mappedTests.length}</p>
      )}
    </div>
  );
}
```

**Important note about mapping:** The existing UI components (TestCard, etc.) expect snake_case properties matching the `types/database.ts` interfaces. Drizzle returns camelCase. We map at the page level to keep components untouched.

- [ ] **Step 2: Rewrite test detail page**

Same pattern as catalog but for a single test by slug. Replace the entire file `src/app/(public)/catalog/[slug]/page.tsx`:

The file keeps the same JSX return but replaces the `getTest` function:

```typescript
// Replace the getTest function at the top:
import { db } from "@/db";
import { tests, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getTest(slug: string): Promise<TestWithCategory | null> {
  const [row] = await db.select({
    id: tests.id, categoryId: tests.categoryId, name: tests.name, slug: tests.slug,
    code: tests.code, price: tests.price, description: tests.description,
    fullDescription: tests.fullDescription, markersCount: tests.markersCount,
    turnaroundDays: tests.turnaroundDays, biomaterial: tests.biomaterial,
    isActive: tests.isActive, isPopular: tests.isPopular, imageUrl: tests.imageUrl,
    metaTitle: tests.metaTitle, metaDescription: tests.metaDescription,
    createdAt: tests.createdAt, updatedAt: tests.updatedAt,
    categories: {
      id: categories.id, name: categories.name, slug: categories.slug,
      description: categories.description, sortOrder: categories.sortOrder,
      isActive: categories.isActive, imageUrl: categories.imageUrl,
      createdAt: categories.createdAt, updatedAt: categories.updatedAt,
    },
  })
    .from(tests)
    .leftJoin(categories, eq(tests.categoryId, categories.id))
    .where(and(eq(tests.slug, slug), eq(tests.isActive, true)))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id, category_id: row.categoryId, name: row.name, slug: row.slug,
    code: row.code ?? "", price: row.price, description: row.description ?? "",
    full_description: row.fullDescription ?? "", markers_count: row.markersCount,
    turnaround_days: row.turnaroundDays, biomaterial: row.biomaterial ?? "",
    is_active: row.isActive ?? true, is_popular: row.isPopular ?? false,
    image_url: row.imageUrl, meta_title: row.metaTitle, meta_description: row.metaDescription,
    created_at: row.createdAt?.toISOString() ?? "", updated_at: row.updatedAt?.toISOString() ?? "",
    categories: {
      id: row.categories?.id ?? "", name: row.categories?.name ?? "",
      slug: row.categories?.slug ?? "", description: row.categories?.description ?? "",
      sort_order: row.categories?.sortOrder ?? 0, is_active: row.categories?.isActive ?? true,
      image_url: row.categories?.imageUrl ?? null,
      created_at: row.categories?.createdAt?.toISOString() ?? "",
      updated_at: row.categories?.updatedAt?.toISOString() ?? "",
    },
  };
}
```

Remove the `import { createClient } from "@/lib/supabase/server"` line. Keep the rest of the file (JSX) unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/catalog/
git commit -m "feat: migrate catalog pages to Drizzle ORM"
```

---

### Task 10: Dashboard Pages

**Files:**
- Rewrite: `src/app/dashboard/orders/page.tsx`
- Rewrite: `src/app/dashboard/orders/[id]/page.tsx`
- Rewrite: `src/app/dashboard/results/page.tsx`
- Rewrite: `src/app/dashboard/profile/page.tsx`
- Rewrite: `src/app/dashboard/page.tsx`

For each file, the pattern is the same: replace `createClient()` + Supabase queries with `db` + Drizzle queries, and replace `supabase.auth.getUser()` with `getUser()` from `@/lib/auth`.

- [ ] **Step 1: Rewrite dashboard/orders/page.tsx**

Replace Supabase imports and queries. Key changes:

```typescript
// Replace imports:
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUser } from "@/lib/auth";
// Remove: import { createClient } from "@/lib/supabase/server";

// Replace the data fetching:
export default async function OrdersPage() {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/dashboard/orders");

  const userOrders = await db.select().from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  // Map to Order type (snake_case)
  const mappedOrders: Order[] = userOrders.map((o) => ({
    id: o.id, order_number: o.orderNumber, user_id: o.userId,
    status: o.status as OrderStatus, total_amount: o.totalAmount,
    customer_name: o.customerName, customer_email: o.customerEmail,
    customer_phone: o.customerPhone, delivery_address: o.deliveryAddress ?? "",
    notes: o.notes ?? "", payment_id: o.paymentId, payment_status: o.paymentStatus,
    paid_at: o.paidAt?.toISOString() ?? null,
    created_at: o.createdAt?.toISOString() ?? "",
    updated_at: o.updatedAt?.toISOString() ?? "",
  }));

  // Use mappedOrders instead of orders in JSX (rename variable)
  // ... rest of JSX stays the same, using mappedOrders
```

Apply the same mapping pattern for all dashboard pages. The JSX stays identical — only the data fetching changes.

- [ ] **Step 2: Rewrite all remaining dashboard pages**

Apply the same pattern to:
- `dashboard/orders/[id]/page.tsx` — fetch order, items, history by id, filter by user_id
- `dashboard/results/page.tsx` — fetch test_results by user_id
- `dashboard/profile/page.tsx` — this is a client component, change to use fetch API calls to new endpoints
- `dashboard/page.tsx` — redirect to orders (keep as-is, it just redirects)

For profile page specifically: convert from Supabase client-side queries to API routes. Create a new API route `src/app/api/profile/route.ts`:

```typescript
// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUser, hashPassword } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db.select({
    id: profiles.id, email: profiles.email,
    fullName: profiles.fullName, phone: profiles.phone,
  }).from(profiles).where(eq(profiles.id, user.id)).limit(1);

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.password) {
    const passwordHash = await hashPassword(body.password);
    await db.update(profiles).set({ passwordHash }).where(eq(profiles.id, user.id));
    return NextResponse.json({ success: true });
  }

  await db.update(profiles).set({
    fullName: body.fullName,
    phone: body.phone,
  }).where(eq(profiles.id, user.id));

  return NextResponse.json({ success: true });
}
```

Then update profile page to use `fetch("/api/profile")` and `fetch("/api/profile", { method: "PUT", ... })`.

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/ src/app/api/profile/
git commit -m "feat: migrate dashboard pages to Drizzle ORM"
```

---

### Task 11: Admin Pages

**Files:**
- Rewrite all files in `src/app/admin/`

Same pattern as dashboard: replace `createClient()` with `db` + Drizzle queries. Admin pages don't need user_id filtering (middleware already verifies admin role).

- [ ] **Step 1: Rewrite admin/page.tsx (dashboard)**

Replace Supabase count queries with Drizzle:

```typescript
import { db } from "@/db";
import { orders, profiles } from "@/db/schema";
import { eq, sql, inArray } from "drizzle-orm";
// ... keep UI imports

export default async function AdminDashboard() {
  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(orders);
  const [{ paid }] = await db.select({ paid: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "paid"));
  const [{ processing }] = await db.select({ processing: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "processing"));
  const [{ completed }] = await db.select({ completed: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "completed"));

  const [{ revenue }] = await db.select({
    revenue: sql<number>`coalesce(sum(total_amount), 0)`,
  }).from(orders).where(inArray(orders.status, ["paid", "processing", "ready", "completed"]));

  const [{ users }] = await db.select({ users: sql<number>`count(*)` }).from(profiles).where(eq(profiles.role, "user"));

  // ... same JSX using these values
```

- [ ] **Step 2: Rewrite all remaining admin pages**

Apply the same pattern (replace `createClient()` → `db`, Supabase query → Drizzle) to:
- `admin/catalog/page.tsx` — list tests with categories
- `admin/catalog/new/page.tsx` — list categories for form
- `admin/catalog/[id]/edit/page.tsx` — get single test + categories
- `admin/orders/page.tsx` — list all orders
- `admin/orders/[id]/page.tsx` — get order + items + results + history
- `admin/users/page.tsx` — list profiles
- `admin/results/page.tsx` — list test_results
- `admin/categories/page.tsx` — list categories

Each follows the pattern: `db.select().from(table)` with appropriate joins and ordering, then map to snake_case types for UI.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/
git commit -m "feat: migrate admin pages to Drizzle ORM"
```

---

### Task 12: API Routes (Payment, Admin Catalog, Admin Orders)

**Files:**
- Rewrite: `src/app/api/payment/create/route.ts`
- Rewrite: `src/app/api/admin/catalog/route.ts`
- Rewrite: `src/app/api/admin/orders/[id]/status/route.ts`
- Rewrite: `src/app/api/admin/orders/[id]/results/route.ts`

- [ ] **Step 1: Rewrite payment/create route**

```typescript
// src/app/api/payment/create/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tests, orders, orderItems, orderStatusHistory } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Введите имя"),
  customerEmail: z.string().email("Введите корректный email"),
  customerPhone: z.string().min(10, "Введите телефон"),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    testId: z.string().uuid(),
    testName: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
  })).min(1, "Корзина пуста"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    const testIds = data.items.map((i) => i.testId);
    const dbTests = await db.select({ id: tests.id, name: tests.name, price: tests.price })
      .from(tests)
      .where(and(inArray(tests.id, testIds), eq(tests.isActive, true)));

    if (dbTests.length !== testIds.length) {
      return NextResponse.json({ error: "Один или несколько тестов недоступны" }, { status: 400 });
    }

    const verifiedItems = data.items.map((item) => {
      const dbTest = dbTests.find((t) => t.id === item.testId)!;
      return { testId: item.testId, testName: dbTest.name, price: dbTest.price, quantity: item.quantity };
    });

    const totalAmount = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const user = await getUser();

    const [order] = await db.insert(orders).values({
      userId: user?.id || null,
      status: "paid",
      totalAmount,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      deliveryAddress: data.deliveryAddress || "",
      notes: data.notes || "",
      paymentId: `STUB-${Date.now()}`,
      paymentStatus: "succeeded",
      paidAt: new Date(),
    }).returning();

    await db.insert(orderItems).values(
      verifiedItems.map((item) => ({
        orderId: order.id,
        testId: item.testId,
        testName: item.testName,
        price: item.price,
        quantity: item.quantity,
      }))
    );

    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      status: "paid",
      comment: "Заказ создан и оплачен (заглушка оплаты)",
    });

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.orderNumber });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Проверьте введённые данные", details: error.issues }, { status: 400 });
    }
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Rewrite admin/catalog route**

```typescript
// src/app/api/admin/catalog/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const [data] = await db.insert(tests).values(body).returning();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const body = await request.json();
  const [data] = await db.update(tests).set(body).where(eq(tests.id, id)).returning();
  return NextResponse.json(data);
}
```

- [ ] **Step 3: Rewrite admin/orders/[id]/status route**

```typescript
// src/app/api/admin/orders/[id]/status/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderStatusHistory } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["pending", "paid", "processing", "ready", "completed", "cancelled", "refunded"]),
  comment: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const data = statusSchema.parse(body);

  await db.update(orders).set({ status: data.status }).where(eq(orders.id, id));
  await db.insert(orderStatusHistory).values({
    orderId: id,
    status: data.status,
    changedBy: admin.id,
    comment: data.comment || "",
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Rewrite admin/orders/[id]/results route (file upload)**

```typescript
// src/app/api/admin/orders/[id]/results/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { testResults } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;

  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const userId = formData.get("userId") as string;
  const description = (formData.get("description") as string) || "";

  if (!file || !userId) {
    return NextResponse.json({ error: "Файл и userId обязательны" }, { status: 400 });
  }

  // Save file to local storage
  const uploadDir = path.join(process.cwd(), "data", "uploads", orderId);
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // Store relative URL for download route
  const fileUrl = `/api/files/${orderId}/${fileName}`;

  await db.insert(testResults).values({
    orderId,
    userId,
    fileUrl,
    fileName: file.name,
    fileSize: file.size,
    description,
    uploadedBy: admin.id,
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Create file download route**

```typescript
// src/app/api/files/[...path]/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getUser } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const segments = (await params).path;
  const orderId = segments[0];

  // Verify access: user owns the order or is admin
  if (user.role !== "admin") {
    const [order] = await db.select({ userId: orders.userId })
      .from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order || order.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const filePath = path.join(process.cwd(), "data", "uploads", ...segments);
  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: { "Content-Type": "application/octet-stream" },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/
git commit -m "feat: migrate all API routes to Drizzle ORM + local file storage"
```

---

### Task 13: Cleanup — Remove Supabase, Update Deployment

**Files:**
- Delete: `src/lib/supabase/` (4 files)
- Delete: `src/app/api/auth/callback/` (already done in Task 5)
- Modify: `Dockerfile`
- Modify: `.github/workflows/deploy.yml`
- Modify: `.dockerignore`

- [ ] **Step 1: Delete Supabase library files**

```bash
rm -rf src/lib/supabase/
```

- [ ] **Step 2: Update Dockerfile — remove Supabase build-args, add data volume**

Replace the entire `Dockerfile`:

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

- [ ] **Step 3: Update deploy.yml — remove Supabase build-args**

Remove the `build-args` section from the "Build and push image" step.

- [ ] **Step 4: Update .dockerignore — add drizzle, keep data out**

Add these lines:

```
data/
drizzle/
```

- [ ] **Step 5: Remove GitHub Secrets that are no longer needed**

```bash
cd "/Users/akhromov/Library/Mobile Documents/com~apple~CloudDocs/Cursor/@work-projects/genesis-app"
gh secret delete NEXT_PUBLIC_SUPABASE_URL 2>/dev/null
gh secret delete NEXT_PUBLIC_SUPABASE_ANON_KEY 2>/dev/null
gh secret delete NEXT_PUBLIC_APP_URL 2>/dev/null
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove Supabase, update Dockerfile and deploy config"
```

---

### Task 14: Server Setup — Create DB, Run Migration, Seed, Deploy

**Files:**
- Modify: `/opt/sites/genesis-app/docker-compose.yml` (on server)
- Modify: `/opt/sites/genesis-app/.env` (on server)

- [ ] **Step 1: Create genesis database on server**

```bash
sshpass -p 'y+S+WU6dh8qsTq' ssh -o StrictHostKeyChecking=no root@5.42.101.27 \
  "docker exec pass24-postgres psql -U pass24 -c 'CREATE DATABASE genesis;'"
```

- [ ] **Step 2: Run SQL migration on server**

Copy the generated migration SQL to the server and execute it:

```bash
# Copy migration file
sshpass -p 'y+S+WU6dh8qsTq' scp drizzle/0001_init.sql root@5.42.101.27:/tmp/genesis_init.sql

# Run migration
sshpass -p 'y+S+WU6dh8qsTq' ssh root@5.42.101.27 \
  "docker exec -i pass24-postgres psql -U pass24 -d genesis < /tmp/genesis_init.sql"
```

- [ ] **Step 3: Seed catalog data on server**

```bash
sshpass -p 'y+S+WU6dh8qsTq' scp supabase/migrations/00002_seed_catalog.sql root@5.42.101.27:/tmp/genesis_seed.sql

sshpass -p 'y+S+WU6dh8qsTq' ssh root@5.42.101.27 \
  "docker exec -i pass24-postgres psql -U pass24 -d genesis < /tmp/genesis_seed.sql"
```

- [ ] **Step 4: Create admin user on server**

```bash
# Generate bcrypt hash for admin password (run locally)
ADMIN_HASH=$(node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('GenesisAdmin2026!', 12).then(h => console.log(h))")

sshpass -p 'y+S+WU6dh8qsTq' ssh root@5.42.101.27 \
  "docker exec pass24-postgres psql -U pass24 -d genesis -c \"
    INSERT INTO profiles (email, password_hash, full_name, role)
    VALUES ('admin@genesisbio.ru', '$ADMIN_HASH', 'Admin', 'admin');
  \""
```

- [ ] **Step 5: Update server .env**

```bash
JWT_SECRET=$(openssl rand -base64 48)

sshpass -p 'y+S+WU6dh8qsTq' ssh root@5.42.101.27 "cat > /opt/sites/genesis-app/.env << EOFENV
DATABASE_URL=postgresql://pass24:8134cb20109a053c55369ac6e232f1d0@pass24-postgres:5432/genesis
JWT_SECRET=$JWT_SECRET
NEXT_PUBLIC_APP_URL=https://genesisbio.ru
EOFENV"
```

- [ ] **Step 6: Update docker-compose.yml (add data volume)**

```bash
sshpass -p 'y+S+WU6dh8qsTq' ssh root@5.42.101.27 "cat > /opt/sites/genesis-app/docker-compose.yml << 'EOFCOMPOSE'
services:
  web:
    image: ghcr.io/akhromovrt/genesis-app:latest
    container_name: site-genesis-app
    restart: unless-stopped
    env_file: .env
    volumes:
      - ./data:/app/data
    networks:
      - onvis-net

networks:
  onvis-net:
    external: true
EOFCOMPOSE"
```

- [ ] **Step 7: Push and deploy**

```bash
git push origin main
gh run watch $(gh run list --limit 1 --json databaseId -q '.[0].databaseId')
```

- [ ] **Step 8: Verify deployment**

```bash
sshpass -p 'y+S+WU6dh8qsTq' ssh root@5.42.101.27 \
  "docker ps --filter name=site-genesis-app && \
   curl -s -o /dev/null -w 'HTTP %{http_code}' -H 'Host: genesisbio.ru' http://localhost/"
```

Expected: container Up, HTTP 200.

- [ ] **Step 9: Commit cleanup**

```bash
git add -A
git commit -m "chore: finalize migration, clean up supabase directory"
```
