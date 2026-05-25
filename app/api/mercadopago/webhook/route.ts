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

    const paymentId = body.data.id;

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

    await supabase
      .from("profiles")
      .update({
        plan,
      })
      .eq("id", userId);

    console.log("PLANO ATUALIZADO:", userId, plan);

    return Response.json({ success: true });
  } catch (error) {
    console.log(error);

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