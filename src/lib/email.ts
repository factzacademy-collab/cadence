import "server-only";

/**
 * Email integration for Cadence.
 *
 * In production, set RESEND_API_KEY (or any provider). Without a key,
 * emails are logged to the server console so the flows remain demoable.
 *
 * Swap the `send` implementation for your provider (Resend, SendGrid,
 * Postmark, AWS SES) — the signature stays the same.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "Cadence <hello@cadence.app>";
export const EMAIL_ENABLED = !!RESEND_API_KEY;

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Send an email. Logs to console in mock mode. */
export async function sendEmail(payload: EmailPayload): Promise<{ id: string; mock: boolean }> {
  if (!RESEND_API_KEY) {
    console.log(
      `\n[email] (mock mode)\n  To: ${payload.to}\n  Subject: ${payload.subject}\n  ---\n  ${payload.text ?? payload.html.replace(/<[^>]+>/g, "").slice(0, 200)}\n`
    );
    return { id: `mock_${Date.now()}`, mock: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[email] Resend API error:", err);
      return { id: `error_${Date.now()}`, mock: true };
    }
    const data = await res.json();
    return { id: data.id ?? `sent_${Date.now()}`, mock: false };
  } catch (e) {
    console.error("[email] send failed:", e);
    return { id: `error_${Date.now()}`, mock: true };
  }
}

/* ---------- Templated emails ---------- */

export function welcomeEmail(name: string): EmailPayload {
  return {
    to: "", // filled by caller
    subject: "Welcome to Cadence — let's find your rhythm",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1a8c8c;">Welcome to Cadence, ${name}!</h1>
        <p>You're all set. Cadence is the calm workspace for planning, publishing, and measuring your social media.</p>
        <p>Here's how to get started:</p>
        <ol>
          <li><strong>Connect a channel</strong> — link your X, Instagram, or LinkedIn in the Integrations tab.</li>
          <li><strong>Schedule your first post</strong> — use the Composer or drag onto the Calendar.</li>
          <li><strong>Check your analytics</strong> — see how your content performs.</li>
        </ol>
        <p>Questions? Just reply to this email — we read every one.</p>
        <p style="color: #888; font-size: 12px; margin-top: 32px;">The Cadence team</p>
      </div>
    `,
    text: `Welcome to Cadence, ${name}!\n\nYou're all set. Connect a channel, schedule your first post, and check your analytics.\n\n— The Cadence team`,
  };
}

export function inviteEmail(workspaceName: string, inviterName: string): EmailPayload {
  return {
    to: "",
    subject: `${inviterName} invited you to ${workspaceName}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1a8c8c;">You're invited!</h1>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> on Cadence.</p>
        <p>Cadence is the social-media orchestration platform for modern teams. Accept this invitation to start scheduling, analyzing, and engaging together.</p>
        <p style="margin: 32px 0;">
          <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}" style="background: #1a8c8c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Accept invitation</a>
        </p>
        <p style="color: #888; font-size: 12px;">If you weren't expecting this invitation, you can safely ignore this email.</p>
      </div>
    `,
    text: `${inviterName} invited you to join ${workspaceName} on Cadence. Visit ${process.env.NEXTAUTH_URL ?? "http://localhost:3000"} to accept.`,
  };
}

export function publishNotificationEmail(name: string, postText: string, platforms: string[]): EmailPayload {
  return {
    to: "",
    subject: `Your post was published on ${platforms.join(", ")}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
        <h1 style="color: #1a8c8c;">Post published ✅</h1>
        <p>Hi ${name}, your post is now live on ${platforms.join(", ")}.</p>
        <blockquote style="border-left: 3px solid #1a8c8c; padding-left: 16px; color: #555; margin: 24px 0;">
          ${postText.slice(0, 200)}${postText.length > 200 ? "…" : ""}
        </blockquote>
        <p>Check your Analytics to see how it performs.</p>
      </div>
    `,
    text: `Hi ${name}, your post was published on ${platforms.join(", ")}:\n\n${postText.slice(0, 200)}`,
  };
}
