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
