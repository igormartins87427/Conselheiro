import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  console.log("WEBHOOK RECEBIDO");

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    console.log("SEM ASSINATURA STRIPE");
    return Response.json({ error: "Sem assinatura." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log("EVENTO STRIPE:", event.type);
  } catch (error) {
    console.log("ERRO AO VALIDAR WEBHOOK:", error);
    return Response.json({ error: "Webhook inválido." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("CHECKOUT COMPLETO");
    console.log("METADATA:", session.metadata);

    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;
    const customerId =
  typeof session.customer === "string"
    ? session.customer
    : null;

    if (!userId || !plan) {
      console.log("SEM USERID OU PLANO NA METADATA");
      return Response.json({ received: true });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
  plan,
  stripe_customer_id: customerId,
  daily_messages: 0,
  last_message_reset: new Date().toISOString(),
})
      .eq("id", userId)
      .select();

    console.log("SUPABASE UPDATE DATA:", data);
    console.log("SUPABASE UPDATE ERROR:", error);
  }

  return Response.json({ received: true });
}