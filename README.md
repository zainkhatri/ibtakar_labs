# Ibtakar Labs Website

Professional website development services with integrated Stripe payments.

## Development Setup

### Quick Start (Frontend Only)
```bash
npm run dev
```
This runs the frontend only. Payment buttons will fallback to Calendly.

### Full Development (Frontend + API)
```bash
npm run dev:full
```
This runs both frontend and backend API routes using Vercel dev server.

**Note**: For full Stripe integration testing, use `npm run dev:full`

## Features

- ✅ Responsive design
- ✅ Service packages with pricing
- ✅ Stripe payment integration
- ✅ Success page handling
- ✅ Firebase reviews system
- ✅ Portfolio showcase
- ✅ Contact forms

## Payment Integration

### Development
- Uses Vercel dev server for API routes
- Fallback to Calendly if API unavailable
- Test with Stripe test cards

### Production
- Secure server-side Stripe integration
- Environment variables for API keys
- Full payment processing

## Deployment

Deploy to Vercel for automatic API route handling:

```bash
vercel --prod
```

## Environment Variables

Set these in Vercel dashboard or `.env.local`:

```
STRIPE_SECRET_KEY=sk_test_...
```

## Testing Payments

Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155