import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-SPONSOR-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { tier_id, sponsor_data } = await req.json();
    if (!tier_id || !sponsor_data) {
      throw new Error("Missing tier_id or sponsor_data");
    }

    logStep("Request data received", { tier_id, sponsor_data });

    // Get the selected tier details
    const { data: tier, error: tierError } = await supabaseClient
      .from('sponsor_tiers')
      .select('*')
      .eq('id', tier_id)
      .single();

    if (tierError) throw new Error(`Error fetching tier: ${tierError.message}`);
    if (!tier) throw new Error("Sponsor tier not found");

    logStep("Tier fetched", { tierName: tier.name, price: tier.price_cents });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: sponsor_data.organization_name,
        metadata: {
          user_id: user.id,
          organization_name: sponsor_data.organization_name
        }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Create or update sponsor record
    const { data: sponsor, error: sponsorError } = await supabaseClient
      .from('sponsors')
      .upsert({
        user_id: user.id,
        organization_name: sponsor_data.organization_name,
        contact_email: sponsor_data.contact_email || user.email,
        phone: sponsor_data.phone,
        website_url: sponsor_data.website_url,
        industry: sponsor_data.industry,
        target_demographics: sponsor_data.target_demographics || [],
        stripe_customer_id: customerId,
        status: 'pending'
      }, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (sponsorError) throw new Error(`Error creating sponsor: ${sponsorError.message}`);
    logStep("Sponsor record created/updated", { sponsorId: sponsor.id });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tier.name} Sponsorship Plan`,
            description: `Monthly sponsorship: ${tier.display_price}`,
          },
          unit_amount: tier.price_cents,
          recurring: { interval: "month" }
        },
        quantity: 1,
      }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/sponsor-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/sponsor-portal?canceled=true`,
      metadata: {
        sponsor_id: sponsor.id,
        tier_id: tier.id,
        user_id: user.id
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});