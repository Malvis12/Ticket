import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// HMAC-SHA512 Verification using Web Crypto API
async function verifyPaystackSignature(rawBody: string, signature: string | null, secretKey: string): Promise<boolean> {
  if (!signature || !secretKey) return false;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const calculatedSignature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return calculatedSignature === signature.toLowerCase();
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // 1. Signature Check (if secret is configured)
    if (paystackSecretKey) {
      const isValid = await verifyPaystackSignature(rawBody, signature, paystackSecretKey);
      if (!isValid) {
        console.warn("Paystack Webhook: Invalid HMAC Signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Filter event type
    if (event !== "charge.success") {
      if (event === "charge.failed") {
        // Release hold if failed
        await supabase
          .from("orders")
          .update({ status: "FAILED" })
          .eq("order_ref", data.reference);
      }
      return new Response(JSON.stringify({ received: true, status: "ignored" }), { status: 200 });
    }

    const orderRef = data.reference;
    const paidAmountKobo = data.amount;
    const paystackTxId = String(data.id || data.reference);

    // 3. Atomic Inventory Commit & Ticket Issuance via RPC
    const { data: commitResult, error: commitError } = await supabase.rpc(
      "commit_inventory_on_payment",
      {
        p_order_ref: orderRef,
        p_payment_ref: paystackTxId,
        p_verified_amount_kobo: paidAmountKobo
      }
    );

    if (commitError) {
      console.error("RPC Commit Inventory Error:", commitError);
      return new Response(JSON.stringify({ error: commitError.message }), { status: 500 });
    }

    // If idempotent noop, exit cleanly
    if (commitResult?.status === "idempotent_noop") {
      return new Response(JSON.stringify({ status: "idempotent_noop" }), { status: 200 });
    }

    // 4. Fetch Order, Event, and Issued Tickets for Notification Emails & Logging (PRD Sections 7, 11, 23)
    const { data: order } = await supabase
      .from("orders")
      .select("*, events(*), tickets(*)")
      .eq("order_ref", orderRef)
      .single();

    if (order) {
      const eventDetails = order.events || {};
      const organizerEmail = eventDetails.official_notification_email || "organizer@thefashionsocial.ng";
      const tickets = order.tickets || [];

      // Build customer passes list in HTML
      const ticketHtmlRows = tickets.map((t: any, i: number) => `
        <div style="background:#141419;border:1px solid #D4AF37;border-radius:8px;padding:12px;margin-bottom:10px;">
          <p style="margin:0;font-size:11px;color:#D4AF37;font-weight:bold;">PASS ${i + 1} OF ${order.quantity}</p>
          <p style="margin:4px 0 0 0;font-size:14px;color:#FFFFFF;font-weight:bold;">Pass No: ${t.ticket_number}</p>
          <p style="margin:2px 0 0 0;font-size:11px;color:#9CA3AF;font-family:monospace;">Token: ${t.qr_token}</p>
        </div>
      `).join('');

      let customerMessageId = `mock_cust_${Date.now()}`;
      let organizerMessageId = `mock_org_${Date.now()}`;

      if (resendApiKey) {
        try {
          // A. Customer Digital Passes Email
          const custRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "The Fashion Social <tickets@thefashionsocial.ng>",
              to: [order.customer_email],
              subject: `Official Admission Passes — ${eventDetails.title || "The Fashion Social"} (${orderRef})`,
              html: `
                <div style="background-color:#070709;padding:24px;color:#F5F2EB;font-family:sans-serif;border-radius:12px;">
                  <h2 style="font-family:serif;color:#F3E5AB;">${eventDetails.title || "The Fashion Social"}</h2>
                  <p>Dear <strong>${order.customer_name}</strong>,</p>
                  <p>Your order <strong>${orderRef}</strong> has been confirmed. Below are your verified admission passes:</p>
                  ${ticketHtmlRows}
                  <p style="font-size:12px;color:#9CA3AF;margin-top:20px;">
                    Present your digital pass or QR token at the gate for entry.
                  </p>
                </div>
              `
            })
          });
          const custData = await custRes.json();
          if (custData?.id) customerMessageId = custData.id;

          // B. Organizer Sale Alert Email (sent to event's configured official_notification_email)
          const orgRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "Marketplace System <notifications@thefashionsocial.ng>",
              to: [organizerEmail],
              subject: `[Sale Alert] ₦${(paidAmountKobo / 100).toLocaleString()} Verified — ${order.customer_name}`,
              html: `
                <div style="font-family:sans-serif;padding:20px;background:#0B0B0E;color:#FFF;border-radius:8px;">
                  <h3 style="color:#D4AF37;">New Verified Ticket Sale</h3>
                  <p><strong>Event:</strong> ${eventDetails.title || "The Fashion Social"}</p>
                  <p><strong>Buyer:</strong> ${order.customer_name} (${order.customer_email})</p>
                  <p><strong>Institution:</strong> ${order.answers?.institution || "N/A"}</p>
                  <p><strong>Quantity:</strong> ${order.quantity} pass(es)</p>
                  <p><strong>Total Paid:</strong> ₦${(paidAmountKobo / 100).toLocaleString()}</p>
                  <p><strong>Order Ref:</strong> ${orderRef}</p>
                </div>
              `
            })
          });
          const orgData = await orgRes.json();
          if (orgData?.id) organizerMessageId = orgData.id;
        } catch (emailErr) {
          console.error("Resend API Transient Failure:", emailErr);
        }
      }

      // Record logs in email_logs and audit_logs
      await supabase.from("email_logs").insert([
        {
          order_id: order.id,
          recipient_email: order.customer_email,
          email_type: "CUSTOMER_TICKETS",
          resend_message_id: customerMessageId,
          status: "SENT"
        },
        {
          order_id: order.id,
          recipient_email: organizerEmail,
          email_type: "ORGANIZER_SALE_ALERT",
          resend_message_id: organizerMessageId,
          status: "SENT"
        }
      ]);

      await supabase.from("audit_logs").insert({
        event_id: order.event_id,
        actor: "PAYSTACK_WEBHOOK",
        action: "PAYMENT_CONFIRMED_EMAILS_DISPATCHED",
        details: `Dispatched ${tickets.length} passes to ${order.customer_email} and sales alert to ${organizerEmail}`
      });
    }

    return new Response(JSON.stringify({ status: "success", order_ref: orderRef }), { status: 200 });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
