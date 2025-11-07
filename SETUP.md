# Setup Instructions

## Environment Variables

Create a `.env.local` file in the root directory with your Stripe keys:

```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

**Note**: Replace with your actual Stripe test keys from the Stripe Dashboard.

## Development

Run the full development server with API routes:

```bash
npm run dev:full
```

Or use Vercel CLI directly:

```bash
vercel dev
```

## Production Deployment

1. Deploy to Vercel
2. Set environment variables in Vercel dashboard:
   - `STRIPE_SECRET_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

## Testing

Visit `http://localhost:3000/test-api.html` to test the Stripe integration.

Use Stripe test cards:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
