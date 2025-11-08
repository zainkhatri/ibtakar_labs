import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  console.log('API called with method:', req.method);
  console.log('Environment check - STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const { serviceType } = req.body;
    console.log('Request body:', req.body);
    console.log('Service type:', serviceType);

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      return res.status(500).json({ error: 'Stripe configuration error' });
    }

    // Map service types to Stripe Price IDs (live mode)
    const priceIds = {
      starter: 'price_1SRK882MvdGcw5oapmDRabcu',    // Starter Website - $1,200
      pro: 'price_1SRK7k2MvdGcw5oaQ6pkkfJV',        // Pro Website - $2,400
      premium: 'price_1SRK7H2MvdGcw5oaAjwaYO6Y',    // Premium Website - $4,000
      managed: 'price_1SRK8z2MvdGcw5oaNDOWT7Q8'     // Managed Web Plan - $50/month
    };

    // Determine payment mode
    const paymentModes = {
      starter: 'payment',
      pro: 'payment',
      premium: 'payment',
      managed: 'subscription'
    };

    const priceId = priceIds[serviceType];
    const mode = paymentModes[serviceType];

    if (!priceId || !mode) {
      return res.status(400).json({ error: 'Invalid service type' });
    }

    console.log('Creating Stripe checkout session with Price ID:', priceId);

    // Create Checkout Session using Price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${req.headers.origin || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}/#services`,
      metadata: {
        service_type: serviceType,
        website: 'ibtakar-labs'
      },
    });

    console.log('Stripe session created successfully:', session.id);

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}
