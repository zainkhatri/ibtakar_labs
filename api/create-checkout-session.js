const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
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

    // Service pricing and details
    const services = {
      starter: {
        name: 'Starter Website',
        price: 120000, // $1,200 in cents
        description: '3 simple pages, basic template design, mobile responsive, contact form, SEO optimization'
      },
      pro: {
        name: 'Pro Website',
        price: 240000, // $2,400 in cents
        description: 'Custom visual design & branding, up to 5 dynamic pages, advanced React animations, e-commerce/booking system, content management dashboard, advanced SEO & analytics, performance optimization, Google Analytics integration'
      },
      premium: {
        name: 'Premium Website',
        price: 400000, // $4,000 in cents
        description: 'Everything in Pro + custom database & API, email automation & marketing, social media integration, payment gateway integration, multi-language support, advanced integrations'
      }
    };

    const service = services[serviceType];
    if (!service) {
      return res.status(400).json({ error: 'Invalid service type' });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: service.name,
              description: service.description,
            },
            unit_amount: service.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/#services`,
      metadata: {
        service_type: serviceType,
        website: 'ibtakar-labs'
      },
      customer_creation: 'always',
      invoice_creation: {
        enabled: true,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}
