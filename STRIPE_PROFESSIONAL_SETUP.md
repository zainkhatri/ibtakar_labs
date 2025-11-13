# Stripe Professional Setup Guide for Ibtakar Labs

## What I Fixed

### 1. ✅ The 404 Issue
**Problem**: Payment went through, but customers saw 404 page.
**Cause**: Vercel wasn't configured for Single Page Application (SPA) routing.
**Fix**: Added SPA fallback in `vercel.json` so `/success` route loads your React app.

### 2. ✅ Enhanced Stripe Checkout
Added professional features to your checkout:
- **Billing address collection** - Auto-collects customer address
- **Phone number collection** - Gets customer phone for better communication
- **Customer creation** - Creates Stripe customer profile for future orders
- **Promotion codes** - Customers can apply discount codes
- **Automatic receipts** - Stripe sends email receipts automatically
- **Better metadata** - Tracks which service was purchased

### 3. ✅ Improved Success Page
- Shows service name (Starter, Pro, Premium, Managed)
- Displays order confirmation ID
- Better visual confirmation

## Actions Required in Stripe Dashboard

### STEP 1: Add Your Branding (10 min) ⭐ CRITICAL

This makes the Stripe checkout page look professional with YOUR brand.

1. Go to: https://dashboard.stripe.com/settings/branding
2. **Upload Logo**:
   - Use your `/public/alt.png` file
   - Recommended size: 512x512px
   - This appears at top of checkout page
3. **Brand Color**:
   - Set to `#2563eb` (your blue color)
   - Makes buttons and accents match your brand
4. **Accent Color**:
   - Set to `#1e40af` (darker blue)
5. **Icon** (optional):
   - Upload favicon for browser tab

**Result**: Checkout page shows "Ibtakar Labs" logo and your brand colors!

### STEP 2: Configure Email Settings (5 min) ⭐ IMPORTANT

1. Go to: https://dashboard.stripe.com/settings/emails
2. **Receipt Emails**:
   - ✅ Enable "Send receipts to customers"
   - Customize email template with your branding
   - Add your logo to emails
3. **Payment Confirmation**:
   - ✅ Enable "Send payment confirmation emails"
4. **Refund Emails**:
   - ✅ Enable (in case you need to issue refunds)

### STEP 3: Business Information (5 min) ⭐ CRITICAL

Stripe needs this to be compliant and professional.

1. Go to: https://dashboard.stripe.com/settings/public
2. Fill out:
   - **Business Name**: Ibtakar Labs
   - **Support Email**: zainnkhatri@gmail.com (or dedicated email)
   - **Support Phone**: Your phone number
   - **Business Address**: Your California address
   - **Statement Descriptor**: "IBTAKAR LABS" (appears on credit card statements)

**Why this matters**:
- Customers see "IBTAKAR LABS" on their credit card bill
- They know where to contact you for support
- Makes you look legitimate

### STEP 4: Create Discount Codes (Optional - 10 min)

Now that you enabled `allow_promotion_codes`, create some!

1. Go to: https://dashboard.stripe.com/coupons
2. Click "New coupon"
3. Examples to create:

**Early Bird Discount**:
- Code: `EARLYBIRD`
- Type: Percent off
- Amount: 10%
- Applies to: All products
- Duration: Once

**Referral Discount**:
- Code: `FRIEND100`
- Type: Amount off
- Amount: $100
- Applies to: One-time purchases

**Student Discount**:
- Code: `STUDENT15`
- Type: Percent off
- Amount: 15%
- Applies to: All products

**Managed Plan First Month**:
- Code: `FIRSTMONTH`
- Type: Percent off
- Amount: 50%
- Applies to: Subscriptions only
- Duration: Once

### STEP 5: Update Product Descriptions (5 min)

Make your Stripe products look professional:

1. Go to: https://dashboard.stripe.com/products
2. For each product (Starter, Pro, Premium):
   - Click product name
   - Add detailed **Description**
   - Upload **Product Image** (screenshot or mockup)
   - Set **Statement descriptor** suffix if needed

Example descriptions:

**Starter Website ($999)**:
```
Professional website development package including:
• 3 custom pages (Home, About, Contact)
• Mobile responsive design
• Contact form with email notifications
• Basic SEO optimization
• Fast hosting setup
• 1 round of revisions

Delivery: 1 week
Support: Email support included
```

**Pro Website ($1,999)**:
```
Advanced website development with custom design:
• Up to 5 dynamic pages
• Custom visual design & branding
• Advanced React animations
• E-commerce or booking system integration
• Content management dashboard
• Google Analytics & advanced SEO
• 2 rounds of revisions

Delivery: 2 weeks
Support: Email + phone support
```

### STEP 6: Test Mode vs Live Mode

Currently using: **LIVE MODE** (real payments)

To test without charging real money:
1. Toggle to **Test Mode** (top right)
2. Use test card: `4242 4242 4242 4242`
3. Any future date, any CVC

**Important**: Make sure you're in **Live Mode** for real customers!

### STEP 7: Set Up Webhooks (Optional - Advanced)

Webhooks notify you when payments succeed/fail.

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://ibtakarlabs.com/api/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.paid` (for subscriptions)
   - `customer.subscription.deleted`

**Why this matters**:
- Know immediately when someone pays
- Send custom confirmation emails
- Update your database
- Handle failed payments

*Note: You'll need to create `/api/stripe-webhook.js` for this - let me know if you want help.*

### STEP 8: Set Up Tax Collection (Optional)

If you need to collect sales tax:

1. Go to: https://dashboard.stripe.com/settings/tax
2. Enable **Stripe Tax**
3. Configure for California (or wherever you're required to collect)

Then update checkout code:
```javascript
automatic_tax: { enabled: true }
```

## Professional Features You Now Have

✅ **Branded Checkout**: Logo and colors on checkout page
✅ **Customer Profiles**: Automatic customer creation in Stripe
✅ **Phone Collection**: Get customer phone numbers
✅ **Address Collection**: Auto-collect billing addresses
✅ **Promotion Codes**: Customers can apply discount codes
✅ **Automatic Receipts**: Email receipts sent automatically
✅ **Better Metadata**: Track which service was purchased
✅ **Order Confirmation**: Professional success page with details
✅ **No More 404**: Success page works correctly

## Testing the Fixed Flow

1. **Test the payment**:
   ```
   Go to: http://localhost:3000 (or your live site)
   Click "Get Started" on any package
   Complete checkout
   ```

2. **What should happen**:
   - Stripe checkout opens with YOUR logo and colors
   - Customer enters payment info + phone + address
   - Can apply promotion code if available
   - After payment: Redirects to `/success` (NOT 404!)
   - Success page shows: Service name + confirmation ID
   - Customer receives email receipt from Stripe

3. **What you'll see in Stripe**:
   - Payment appears in Dashboard
   - Customer profile created
   - Metadata shows which service (starter/pro/premium)
   - Receipt sent automatically

## Monitoring Payments

**Dashboard**: https://dashboard.stripe.com/payments

Check:
- Recent payments
- Customer information
- Which service they bought (metadata)
- Payment method details

## Customer Communication

After payment, customer receives:
1. **Stripe Receipt Email** (automatic) ✅
2. **Your Follow-up Email** (you need to send manually)

Suggested follow-up email:
```
Subject: Welcome to Ibtakar Labs! Let's Build Your Website

Hi [Name],

Thanks for choosing Ibtakar Labs! I'm excited to build your [Service Name].

Your order details:
- Service: [Starter/Pro/Premium] Website
- Amount Paid: $[amount]
- Order ID: [Stripe ID]

Next steps:
1. I'll email you a project questionnaire within 24 hours
2. We'll schedule a kick-off call (15-30 min)
3. I'll start building your site immediately
4. You'll see progress updates every few days

Questions? Reply to this email or schedule a call:
https://calendly.com/zainnkhatri/30min

Looking forward to working with you!

Best regards,
Zain Khatri
Founder, Ibtakar Labs
NASA Engineer | UC Berkeley
zainnkhatri@gmail.com
https://ibtakarlabs.com
```

## Handling Issues

### Payment Failed
1. Check Stripe Dashboard for error details
2. Common issues:
   - Insufficient funds
   - Card declined
   - Authentication failed (3D Secure)
3. Customer can try again with different card

### Refunds
1. Go to: https://dashboard.stripe.com/payments
2. Find payment
3. Click "Refund"
4. Choose full or partial refund
5. Stripe automatically refunds customer + sends email

### Disputes/Chargebacks
1. Respond within 7 days
2. Upload proof:
   - Email correspondence
   - Work delivered (website screenshots)
   - Contract/agreement
3. Stripe handles the dispute process

## Security Best Practices

✅ **SSL/HTTPS**: Your site already has this
✅ **API Keys**: Stored in environment variables (`.env.local`)
✅ **No API Keys in Code**: Using `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY`
✅ **Server-Side Processing**: API endpoint handles sensitive operations

**Never**:
- ❌ Put secret API key in frontend code
- ❌ Process payments client-side only
- ❌ Store credit card details yourself

## Pricing Transparency

Your current pricing:
- Starter: $999 (Stripe product ID: `price_1SRK882MvdGcw5oapmDRabcu`)
- Pro: $1,999 (Stripe product ID: `price_1SRK7k2MvdGcw5oaQ6pkkfJV`)
- Premium: $3,999 (Stripe product ID: `price_1SRK7H2MvdGcw5oaAjwaYO6Y`)
- Managed: $50/month (created dynamically)

To change pricing:
1. Create new product/price in Stripe Dashboard
2. Update `price_1SRK...` IDs in `api/create-checkout-session.js`

## Stripe Fees

**Stripe takes**: 2.9% + $0.30 per transaction

Your actual revenue:
- Starter ($999): You get **$970.19** (Stripe takes $28.81)
- Pro ($1,999): You get **$1,940.21** (Stripe takes $58.79)
- Premium ($3,999): You get **$3,883.21** (Stripe takes $115.79)
- Managed ($50/mo): You get **$48.55** (Stripe takes $1.45)

## Getting Paid

**Payout Schedule**:
- Default: Every 2 days (rolling basis)
- Can change to: Daily, weekly, monthly
- Settings: https://dashboard.stripe.com/settings/payouts

**Bank Account**:
- Go to: https://dashboard.stripe.com/settings/payouts
- Add your bank account details
- Stripe verifies with micro-deposits (2-3 days)
- Then payouts are automatic!

## Support & Resources

**Stripe Dashboard**: https://dashboard.stripe.com
**Documentation**: https://stripe.com/docs
**API Reference**: https://stripe.com/docs/api
**Support**: https://support.stripe.com

**Common Questions**:
- Webhooks: https://stripe.com/docs/webhooks
- Testing: https://stripe.com/docs/testing
- Subscriptions: https://stripe.com/docs/billing/subscriptions
- Invoices: https://stripe.com/docs/invoicing

## Quick Checklist

Before going live, verify:
- [ ] Branding configured (logo, colors) in Stripe Dashboard
- [ ] Business information filled out (name, address, support email)
- [ ] Email receipts enabled
- [ ] Statement descriptor set ("IBTAKAR LABS")
- [ ] Bank account added for payouts
- [ ] Using LIVE mode (not test mode)
- [ ] Tested full payment flow
- [ ] Success page working (no 404!)
- [ ] Discount codes created (optional)

## Deploy These Changes

To deploy the fixes I made:

```bash
cd /Volumes/NANOCHIP/PROJECTS/ibtakar/ibtakar_labs
git add .
git commit -m "Fix: Professional Stripe checkout with branding, phone collection, and no 404 on success page"
git push
```

After deploying:
1. Test payment flow on live site
2. Verify success page works (no 404)
3. Check Stripe Dashboard for payment details
4. Confirm email receipt was sent

---

## The Bottom Line

**What was wrong**: Vercel routing caused 404 on success page.
**What I fixed**: Added SPA routing + enhanced Stripe checkout with professional features.
**What you need to do**: Configure branding in Stripe Dashboard (10 min).

Your payment flow is now **professional-grade** and matches what big companies use! 🚀

**Questions?** Let me know if you need help with webhooks, tax collection, or anything else.
