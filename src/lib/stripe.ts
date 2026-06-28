import "server-only";
import Stripe from "stripe";
import { db } from "@/lib/db";

/**
 * Stripe integration for Cadence.
 *
 * In production, set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
 * Without keys, the lib runs in "mock mode" — checkout returns a fake
 * session URL so the billing flow remains demoable.
 */

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const stripe = SECRET_KEY
  ? new Stripe(SECRET_KEY, { apiVersion: "2025-08-27.basil" as Stripe.LatestApiVersion })
  : null;

export const STRIPE_ENABLED = !!SECRET_KEY;
export { WEBHOOK_SECRET };

/** Price IDs per plan/cycle. Configure these in your Stripe dashboard. */
export const PRICE_IDS: Record<string, { monthly: string; annual: string }> = {
  team: {
    monthly: process.env.STRIPE_PRICE_TEAM_MONTHLY ?? "price_team_monthly",
    annual: process.env.STRIPE_PRICE_TEAM_ANNUAL ?? "price_team_annual",
  },
  scale: {
    monthly: process.env.STRIPE_PRICE_SCALE_MONTHLY ?? "price_scale_monthly",
    annual: process.env.STRIPE_PRICE_SCALE_ANNUAL ?? "price_scale_annual",
  },
};

export interface CheckoutOptions {
  plan: "team" | "scale";
  cycle: "monthly" | "annual";
  seats: number;
  userId: string;
  workspaceId: string;
  email: string;
}

/** Create a Stripe Checkout session (or a mock one if Stripe isn't configured). */
export async function createCheckoutSession(opts: CheckoutOptions): Promise<{ url: string; sessionId: string }> {
  if (!stripe) {
    // Mock mode — return a fake success URL so the flow is demoable.
    const sessionId = `cs_test_mock_${Date.now()}`;
    const url = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/#app/billing?checkout=success&session=${sessionId}`;
    console.log("[stripe] mock checkout session created:", sessionId);
    return { url, sessionId };
  }

  const priceId = PRICE_IDS[opts.plan]?.[opts.cycle];
  if (!priceId) throw new Error(`No price ID configured for ${opts.plan}/${opts.cycle}`);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: opts.email,
    line_items: [{ price: priceId, quantity: opts.seats }],
    client_reference_id: opts.workspaceId,
    metadata: { userId: opts.userId, workspaceId: opts.workspaceId, plan: opts.plan, cycle: opts.cycle },
    success_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/#app/billing?checkout=success&session={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/#app/billing?checkout=cancelled`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { workspaceId: opts.workspaceId, plan: opts.plan } },
  });

  return { url: session.url ?? "", sessionId: session.id };
}

/** Handle a Stripe webhook event (subscription lifecycle). */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const workspaceId = s.metadata?.workspaceId ?? s.client_reference_id;
      const plan = s.metadata?.plan ?? "team";
      if (workspaceId) {
        await db.workspace.update({
          where: { id: workspaceId },
          data: { plan },
        });
        console.log(`[stripe] workspace ${workspaceId} upgraded to ${plan}`);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata?.workspaceId;
      if (workspaceId) {
        await db.workspace.update({
          where: { id: workspaceId },
          data: { plan: "free" },
        });
        console.log(`[stripe] workspace ${workspaceId} downgraded to free`);
      }
      break;
    }
    default:
      // Acknowledge other events silently
      break;
  }
}
