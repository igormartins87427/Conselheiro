import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.json();

  const { customerId } = body;

  if (!customerId) {
    return Response.json(
      { error: "Cliente não informado." },
      { status: 400 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/chat`,
  });

  return Response.json({
    url: session.url,
  });
}