import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

const prices = {
  essential: {
    title: "Conselheiro da Fé - Essencial",
    price: 19.9,
  },
  voice: {
    title: "Conselheiro da Fé - Voz",
    price: 29.9,
  },
  memory: {
    title: "Conselheiro da Fé - Memória",
    price: 49.9,
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { plan, userId } = body;

    if (!plan || !userId) {
      return Response.json(
        { error: "Plano ou usuário não informado." },
        { status: 400 }
      );
    }

    const selectedPlan = prices[plan as keyof typeof prices];

    if (!selectedPlan) {
      return Response.json(
        { error: "Plano inválido." },
        { status: 400 }
      );
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: plan,
            title: selectedPlan.title,
            quantity: 1,
            unit_price: selectedPlan.price,
            currency_id: "BRL",
          },
        ],
        external_reference: `${userId}|${plan}`,
        back_urls: {
  success: "http://localhost:3000/chat?payment=success",
  failure: "http://localhost:3000/plans?payment=failure",
  pending: "http://localhost:3000/plans?payment=pending",
}
        
      },
    });

    return Response.json({
      url: result.init_point,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      { error: "Erro ao criar checkout Mercado Pago." },
      { status: 500 }
    );
  }
}