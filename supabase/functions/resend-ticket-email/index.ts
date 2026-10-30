import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return new Response(JSON.stringify({ error: "Missing order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 1. Verify order is PAID
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, events(*), tickets(*)")
      .eq("id", order_id)
      .single();

    if (orderErr || !order || order.status !== "PAID") {
      return new Response(JSON.stringify({ error: "Order must be in PAID status to resend" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const tickets = order.tickets || [];
    const eventDetails = order.events || {};

    const ticketHtmlRows = tickets.map((t: any, i: number) => `
      <div style="background:#141419;border:1px solid #D4AF37;border-radius:8px;padding:12px;margin-bottom:10px;">
        <p style="margin:0;font-size:11px;color:#D4AF37;font-weight:bold;">PASS ${i + 1} OF ${order.quantity}</p>
        <p style="margin:4px 0 0 0;font-size:14px;color:#FFFFFF;font-weight:bold;">Pass No: ${t.ticket_number}</p>
        <p style="margin:2px 0 0 0;font-size:11px;color:#9CA3AF;font-family:monospace;">Token: ${t.qr_token}</p>
      </div>
    `).join('');

    // 2. Re-dispatch via Resend API (Never recreate tickets or charge again)
    let resendMessageId = `mock_re_${Date.now()}`;
    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "The Fashion Social <tickets@thefashionsocial.ng>",
          to: [order.customer_email],
          subject: `[Resent] Official Admission Passes — ${order.order_ref}`,
          html: `
            <div style="background-color:#070709;padding:24px;color:#F5F2EB;font-family:sans-serif;border-radius:12px;">
              <h2 style="font-family:serif;color:#F3E5AB;">${eventDetails.title || "The Fashion Social"}</h2>
              <p>Dear <strong>${order.customer_name}</strong>,</p>
              <p>Your admission passes for order <strong>${order.order_ref}</strong> have been resent by the event organizers.</p>
              ${ticketHtmlRows}
              <p style="font-size:12px;color:#9CA3AF;margin-top:20px;">
                Present your digital pass or QR token at the gate for entry.
              </p>
            </div>
          `
        })
      });
      const data = await res.json();
      if (data.id) resendMessageId = data.id;
    }

    // 3. Log to email_logs with retry tracking and audit_logs
    const { data: existingLog } = await supabase
      .from("email_logs")
      .select("retry_count")
      .eq("order_id", order.id)
      .eq("email_type", "CUSTOMER_TICKETS")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextRetryCount = (existingLog?.retry_count || 0) + 1;

    await supabase.from("email_logs").insert({
      order_id: order.id,
      recipient_email: order.customer_email,
      email_type: "CUSTOMER_TICKETS",
      resend_message_id: resendMessageId,
      status: "SENT",
      retry_count: nextRetryCount
    });

    await supabase.from("audit_logs").insert({
      event_id: order.event_id,
      actor: "ORGANIZER_RESEND_ACTION",
      action: "TICKET_EMAIL_RESENT",
      details: `Idempotent resend triggered for order ${order.order_ref} to ${order.customer_email} (Attempt #${nextRetryCount})`
    });

    return new Response(
      JSON.stringify({ success: true, order_ref: order.order_ref, resend_id: resendMessageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
