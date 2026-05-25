import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const prices = {
  essential: "price_1TaoIfDoIHTdwo6JB3WratSq",
  voice: "price_1TaoJ1DoIHTdwo6JzZNi9oMz",
  memory: "price_1TaoJFDoIHTdwo6JfK0t6djB",
};

export async function POST(req: Request) {
  const body = await req.json();

  const { plan, userId } = body;

  if (!plan || !userId) {
    return Response.json(
      { error: "Plano ou usuário não informado." },
      { status: 400 }
    );
  }

  const priceId = prices[plan as keyof typeof prices];

  if (!priceId) {
    return Response.json(
      { error: "Plano inválido." },
      { status: 400 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/chat?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/plans?payment=cancelled`,
    metadata: {
      userId,
      plan,
    },
  });

  return Response.json({
    url: session.url,
  });
}