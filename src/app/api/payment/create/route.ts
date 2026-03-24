import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Введите имя"),
  customerEmail: z.string().email("Введите корректный email"),
  customerPhone: z.string().min(10, "Введите телефон"),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      testId: z.string().uuid(),
      testName: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Корзина пуста"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    const adminDb = createAdminClient();

    // Verify prices against DB to prevent tampering
    const testIds = data.items.map((i) => i.testId);
    const { data: tests, error: testsError } = await adminDb
      .from("tests")
      .select("id, name, price")
      .in("id", testIds)
      .eq("is_active", true);

    if (testsError || !tests || tests.length !== testIds.length) {
      return NextResponse.json(
        { error: "Один или несколько тестов недоступны" },
        { status: 400 }
      );
    }

    // Build verified items with DB prices
    const verifiedItems = data.items.map((item) => {
      const dbTest = tests.find((t) => t.id === item.testId);
      if (!dbTest) throw new Error("Test not found");
      return {
        test_id: item.testId,
        test_name: dbTest.name,
        price: dbTest.price, // use DB price, not client price
        quantity: item.quantity,
      };
    });

    const totalAmount = verifiedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Get current user (optional — guest checkout supported)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Create order
    const { data: order, error: orderError } = await adminDb
      .from("orders")
      .insert({
        user_id: user?.id || null,
        status: "paid", // STUB: skip payment, mark as paid immediately
        total_amount: totalAmount,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        delivery_address: data.deliveryAddress || "",
        notes: data.notes || "",
        payment_id: `STUB-${Date.now()}`, // STUB: fake payment ID
        payment_status: "succeeded", // STUB
        paid_at: new Date().toISOString(), // STUB
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Ошибка создания заказа" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = verifiedItems.map((item) => ({
      order_id: order.id,
      ...item,
    }));

    const { error: itemsError } = await adminDb
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      return NextResponse.json(
        { error: "Ошибка создания позиций заказа" },
        { status: 500 }
      );
    }

    // Create status history entry
    await adminDb.from("order_status_history").insert({
      order_id: order.id,
      status: "paid",
      comment: "Заказ создан и оплачен (заглушка оплаты)",
    });

    // TODO: Replace with real YooKassa integration
    // For now, return success directly instead of redirect to payment page
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      // In production: confirmationUrl from YooKassa
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Проверьте введённые данные", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Payment create error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
