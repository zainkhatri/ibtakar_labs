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

    // Service pricing and details - using actual Stripe product IDs
    const services = {
      starter: {
        priceId: 'price_1SRK882MvdGcw5oapmDRabcu', // $999.99 Starter Website
        mode: 'payment'
      },
      pro: {
        priceId: 'price_1SRK7k2MvdGcw5oaQ6pkkfJV', // $1,999.99 Pro Website
        mode: 'payment'
      },
      premium: {
        priceId: 'price_1SRK7H2MvdGcw5oaAjwaYO6Y', // $3,999.99 Premium Website
        mode: 'payment'
      },
      managed: {
        name: 'Managed Web Plan',
        price: 5000, // $50 in cents
        description: 'Managed hosting, SSL certificates, domain renewal, security updates, content updates & revisions, technical support, performance monitoring, email support',
        mode: 'subscription',
        recurring: 'month'
      }
    };

    const service = services[serviceType];
    if (!service) {
      return res.status(400).json({ error: 'Invalid service type' });
    }

    console.log('Creating Stripe checkout session...');

    // Build line items based on service type
    const lineItems = service.priceId ? [
      {
        price: service.priceId,
        quantity: 1,
      },
    ] : [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: service.name,
            description: service.description,
          },
          unit_amount: service.price,
          recurring: service.recurring ? {
            interval: service.recurring,
          } : undefined,
        },
        quantity: 1,
      },
    ];

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: service.mode,
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
