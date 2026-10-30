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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { scan_input, ticket_number, qr_token, event_id, staff_user_id } = body;
    const effectiveInput = (scan_input || qr_token || ticket_number || "").trim();

    if (!effectiveInput || !event_id) {
      return new Response(
        JSON.stringify({ error: "Missing scan input (QR token or ticket number) or event_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call atomic gate validation RPC (supports both QR token and manual ticket number fallback)
    const { data: scanResult, error: rpcError } = await supabase.rpc(
      "validate_gate_scan",
      {
        p_scan_input: effectiveInput,
        p_event_id: event_id,
        p_staff_user_id: staff_user_id || null
      }
    );

    if (rpcError) {
      return new Response(
        JSON.stringify({ error: rpcError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(scanResult),
      {
        status: scanResult.http_status || 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
