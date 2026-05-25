import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

const payment = new Payment(client);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("WEBHOOK MP:", body);

    if (body.type !== "payment") {
      return Response.json({ received: true });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      return Response.json({ received: true });
    }

    const paymentData = await payment.get({
      id: paymentId,
    });

    console.log("PAYMENT DATA:", paymentData);

    if (paymentData.status !== "approved") {
      return Response.json({ received: true });
    }

    const externalReference = paymentData.external_reference;

    if (!externalReference) {
      return Response.json({ received: true });
    }

    const [userId, plan] = externalReference.split("|");

    if (!userId || !plan) {
      return Response.json({ received: true });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        plan,
        subscription_status: "active",
        subscription_expires_at: expiresAt.toISOString(),
        mercadopago_payment_id: String(paymentData.id),
        daily_messages: 0,
        last_message_reset: new Date().toISOString(),
      })
      .eq("id", userId)
      .select();

    console.log("PLANO ATUALIZADO:", data);
    console.log("ERRO SUPABASE:", error);

    return Response.json({ success: true });
  } catch (error) {
    console.log("ERRO WEBHOOK MP:", error);

    return Response.json(
      {
        error: "Erro no webhook Mercado Pago",
      },
      {
        status: 500,
      }
    );
  }
}