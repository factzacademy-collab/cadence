import { NextRequest, NextResponse } from "next/server";
import { stripe, WEBHOOK_SECRET, handleWebhookEvent } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Stripe webhook handler.
 * Verifies the signature (if STRIPE_WEBHOOK_SECRET is set) and dispatches
 * the event to handleWebhookEvent.
 */
export async function POST(req: NextRequest) {
  if (!stripe || !WEBHOOK_SECRET) {
    // Mock mode — acknowledge all webhooks with 200
    console.log("[stripe/webhook] mock mode: acknowledged");
    return NextResponse.json({ received: true, mock: true });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe/webhook] handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
