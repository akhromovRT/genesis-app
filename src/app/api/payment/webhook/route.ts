import { NextResponse } from "next/server";

// TODO: Implement real YooKassa webhook handler
// This is a stub — will be replaced when YooKassa integration is added
export async function POST() {
  // In production:
  // 1. Verify YooKassa IP / signature
  // 2. Parse event type (payment.succeeded, payment.canceled, refund.succeeded)
  // 3. Extract order_id from metadata
  // 4. Update order status
  // 5. Send email notification
  // 6. Return 200

  return NextResponse.json({ status: "stub" });
}
