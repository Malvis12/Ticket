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
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();

    const {
      event_id,
      category_id,
      quantity,
      customer_name,
      customer_email,
      customer_phone,
      answers,
      user_id
    } = body;

    // Strict validation
    if (!event_id || !category_id || !quantity || !customer_email || !customer_name) {
      return new Response(
        JSON.stringify({ error: "Missing required checkout parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (quantity < 1 || quantity > 10) {
      return new Response(
        JSON.stringify({ error: "Quantity must be between 1 and 10" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call atomic reservation RPC (Zero-Trust pricing computed exclusively on server)
    const { data: reserveData, error: rpcError } = await supabase.rpc(
      "reserve_marketplace_tickets",
      {
        p_event_id: event_id,
        p_category_id: category_id,
        p_quantity: quantity,
        p_user_id: user_id || null,
        p_customer_name: customer_name,
        p_customer_email: customer_email,
        p_customer_phone: customer_phone || "",
        p_answers: answers || {}
      }
    );

    if (rpcError) {
      console.error("RPC Reservation Error:", rpcError);
      return new Response(
        JSON.stringify({ error: rpcError.message || "Failed to reserve tickets" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { order_ref, amount_kobo: subtotalKobo, expires_at } = reserveData;

    // Fetch Event for Fee Mode calculation (ABSORB vs PASS_TO_BUYER - PRD Sections 10 & 19)
    const { data: eventData } = await supabase
      .from("events")
      .select("service_fee_mode, reservation_hold_minutes, official_notification_email")
      .eq("id", event_id)
      .single();

    const feeMode = eventData?.service_fee_mode || "ABSORB";
    let platformFeeKobo = 0;
    let finalChargeKobo = subtotalKobo;

    if (feeMode === "PASS_TO_BUYER") {
      // 2.5% fee passed transparently to buyer
      platformFeeKobo = Math.round(subtotalKobo * 0.025);
      finalChargeKobo = subtotalKobo + platformFeeKobo;

      // Update order total in database to include buyer-paid service fee
      await supabase
        .from("orders")
        .update({ total_price_kobo: finalChargeKobo })
        .eq("order_ref", order_ref);
    }

    // Optional: Initialize Paystack transaction if secret key is present
    let paystackAccessCode = `acc_${order_ref}`;
    let paystackAuthUrl = `https://checkout.paystack.com/${paystackAccessCode}`;

    if (paystackSecretKey) {
      try {
        const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: finalChargeKobo,
            email: customer_email,
            reference: order_ref,
            metadata: {
              event_id,
              category_id,
              customer_name,
              quantity,
              fee_mode: feeMode,
              subtotal_kobo: subtotalKobo,
              platform_fee_kobo: platformFeeKobo,
              institution: answers?.institution || "Unspecified"
            }
          })
        });

        const paystackData = await paystackRes.json();
        if (paystackData.status && paystackData.data) {
          paystackAccessCode = paystackData.data.access_code;
          paystackAuthUrl = paystackData.data.authorization_url;
        }
      } catch (paystackErr) {
        console.warn("Paystack initialize error (using fallback code):", paystackErr);
      }
    }

    return new Response(
      JSON.stringify({
        order_ref,
        subtotal_kobo: subtotalKobo,
        platform_fee_kobo: platformFeeKobo,
        amount_kobo: finalChargeKobo,
        fee_mode: feeMode,
        currency: "NGN",
        expires_at,
        paystack_access_code: paystackAccessCode,
        paystack_authorization_url: paystackAuthUrl
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error in initialize-payment:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
