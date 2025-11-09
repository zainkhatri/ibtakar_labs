export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
  const keyPrefix = process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 12) + '...' : 'Not found';

  res.status(200).json({ 
    message: 'Environment test',
    hasStripeKey,
    keyPrefix,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}





