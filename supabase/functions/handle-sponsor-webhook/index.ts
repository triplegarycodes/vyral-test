import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseServiceRole = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SPONSOR-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !endpointSecret) {
    logStep("Missing signature or endpoint secret");
    return new Response("Missing signature or endpoint secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    
    logStep("Webhook event received", { type: event.type, id: event.id });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Webhook error", { error: error.message });
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});

async function handleCheckoutSessionCompleted(session: any) {
  logStep("Processing checkout completion", { sessionId: session.id });

  const { sponsor_id, tier_id } = session.metadata;

  if (!sponsor_id || !tier_id) {
    logStep("Missing metadata in session", session.metadata);
    return;
  }

  // Create subscription record
  const { error: subError } = await supabaseServiceRole
    .from('sponsor_subscriptions')
    .insert({
      sponsor_id,
      tier_id,
      stripe_subscription_id: session.subscription,
      status: 'active',
      current_period_start: new Date(session.created * 1000).toISOString(),
      current_period_end: session.subscription ? null : new Date((session.created + 2592000) * 1000).toISOString() // 30 days if no subscription
    });

  if (subError) {
    logStep("Error creating subscription record", { error: subError.message });
    return;
  }

  // Update sponsor status
  const { error: sponsorError } = await supabaseServiceRole
    .from('sponsors')
    .update({ status: 'active' })
    .eq('id', sponsor_id);

  if (sponsorError) {
    logStep("Error updating sponsor status", { error: sponsorError.message });
    return;
  }

  logStep("Checkout completion processed successfully", { sponsor_id, tier_id });
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  logStep("Processing successful payment", { invoiceId: invoice.id });

  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  
  // Update subscription record
  const { error } = await supabaseServiceRole
    .from('sponsor_subscriptions')
    .update({
      status: 'active',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('stripe_subscription_id', invoice.subscription);

  if (error) {
    logStep("Error updating subscription after payment", { error: error.message });
  } else {
    logStep("Payment processed successfully", { subscriptionId: invoice.subscription });
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  logStep("Processing failed payment", { invoiceId: invoice.id });

  if (!invoice.subscription) return;

  // Update subscription status to past_due
  const { error } = await supabaseServiceRole
    .from('sponsor_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription);

  if (error) {
    logStep("Error updating subscription after failed payment", { error: error.message });
  } else {
    logStep("Failed payment processed", { subscriptionId: invoice.subscription });
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  logStep("Processing subscription update", { subscriptionId: subscription.id });

  const status = subscription.status === 'active' ? 'active' : 
                subscription.status === 'past_due' ? 'past_due' :
                subscription.status === 'canceled' ? 'canceled' : 'paused';

  const { error } = await supabaseServiceRole
    .from('sponsor_subscriptions')
    .update({
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    logStep("Error updating subscription", { error: error.message });
  } else {
    logStep("Subscription updated successfully", { subscriptionId: subscription.id, status });
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  logStep("Processing subscription deletion", { subscriptionId: subscription.id });

  // Update subscription status to canceled
  const { error: subError } = await supabaseServiceRole
    .from('sponsor_subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  // Update sponsor status to canceled
  const { data: subData } = await supabaseServiceRole
    .from('sponsor_subscriptions')
    .select('sponsor_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (subData) {
    const { error: sponsorError } = await supabaseServiceRole
      .from('sponsors')
      .update({ status: 'canceled' })
      .eq('id', subData.sponsor_id);

    if (sponsorError) {
      logStep("Error updating sponsor status on cancellation", { error: sponsorError.message });
    }
  }

  if (subError) {
    logStep("Error updating subscription on cancellation", { error: subError.message });
  } else {
    logStep("Subscription cancellation processed", { subscriptionId: subscription.id });
  }
}