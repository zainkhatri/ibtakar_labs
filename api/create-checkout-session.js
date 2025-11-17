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
        name: 'Starter Website',
        priceId: 'price_1SRK882MvdGcw5oapmDRabcu', // $999 Starter Website
        mode: 'payment'
      },
      pro: {
        name: 'Pro Website',
        priceId: 'price_1SRK7k2MvdGcw5oaQ6pkkfJV', // $1,999 Pro Website
        mode: 'payment'
      },
      premium: {
        name: 'Premium Website',
        priceId: 'price_1SRK7H2MvdGcw5oaAjwaYO6Y', // $3,999 Premium Website
        mode: 'payment'
      },
      managed: {
        name: 'Managed Web Plan',
        priceId: 'price_1SUKwg2MvdGcw5oadPVomEaF', // $22/month Managed Web Plan
        mode: 'subscription'
      },
      studentPortfolio: {
        name: 'Student Portfolio Special',
        priceId: 'price_1SUKta2MvdGcw5oaNrr2ZTAr', // $200 Student Portfolio
        mode: 'payment'
      },
      test: {
        name: 'Test Payment ($1)',
        priceId: 'price_1SSpq32MvdGcw5oaJxAjESrg', // $1 Test subscription
        mode: 'subscription'
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

      // Professional branding and customization
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true,
      },
      // Only create customer for payment mode, subscriptions auto-create customers
      customer_creation: service.mode === 'payment' ? 'always' : undefined,

      // Custom branding (configure in Stripe Dashboard: Settings > Branding)
      // This will show your logo and brand colors on the checkout page

      // Collect customer email for receipts
      submit_type: service.mode === 'subscription' ? 'subscribe' : 'pay',

      // Add metadata for tracking
      metadata: {
        service_type: serviceType,
        website: 'ibtakar-labs',
        business_name: 'Ibtakar Labs',
      },

      // Allow promotion codes (you can create these in Stripe Dashboard)
      allow_promotion_codes: true,

      // Automatically send receipt emails - let Stripe handle it automatically
      payment_intent_data: service.mode === 'payment' ? {
        metadata: {
          service_type: serviceType,
          service_name: service.name,
        },
      } : undefined,

      // For subscriptions
      subscription_data: service.mode === 'subscription' ? {
        metadata: {
          service_type: serviceType,
          service_name: service.name,
        },
      } : undefined,
    });

    console.log('Stripe session created successfully:', session.id);

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}
