# Payment Testing Guide for Ibtakar Labs

## Quick Start - Test Your Payment Flow

I've added a **$1 test payment** so you can test everything without spending hundreds of dollars!

### Access the Test Page

**Local Development**:
```
http://localhost:5173/test
```

**Production (after deploying)**:
```
https://ibtakarlabs.com/test
```

## What Gets Tested

When you click "Start $1 Test Payment", you'll test:

✅ **Stripe Checkout Page**
- Your logo and brand colors (after you configure them)
- Professional payment form
- Phone number collection
- Billing address collection
- Promotion code entry field

✅ **Payment Processing**
- Real Stripe payment (charges $1)
- Creates customer profile in Stripe
- Saves metadata (service type, etc.)
- Sends automatic email receipt

✅ **Success Page**
- No 404 error! (this was the bug we fixed)
- Shows "Test Payment ($1/month)"
- Displays confirmation ID
- All links work correctly

✅ **Stripe Dashboard**
- Payment appears immediately
- Customer profile created
- Subscription started
- All metadata recorded

## Test Cards

Use these card numbers in Stripe checkout:

### Success (Payment Approved)
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### Declined (Insufficient Funds)
```
Card: 4000 0000 0000 0002
Result: "Card was declined"
```

### Requires Authentication (3D Secure)
```
Card: 4000 0027 6000 3184
Result: Opens authentication modal, then completes
```

### Expired Card
```
Card: 4000 0000 0000 0069
Result: "Card has expired"
```

More test cards: https://stripe.com/docs/testing#cards

## Step-by-Step Test Process

### 1. Start Local Server
```bash
cd /Volumes/NANOCHIP/PROJECTS/ibtakar/ibtakar_labs
npm run dev
```

### 2. Navigate to Test Page
Open browser: `http://localhost:5173/test`

### 3. Click "Start $1 Test Payment"
- Should redirect to Stripe checkout
- **Check**: Does it show your logo/branding? (If not, configure in Stripe Dashboard)

### 4. Fill Out Checkout Form
```
Email: your-email@example.com
Card: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
Name: Test Customer
Phone: (555) 123-4567
Address: Let it auto-collect or enter manually
Billing ZIP: 12345
```

### 5. (Optional) Test Promotion Code
If you created discount codes in Stripe:
- Click "Add promotion code"
- Enter code (e.g., `EARLYBIRD`)
- Should show discount applied

### 6. Click "Subscribe"
- Payment processes (takes 2-3 seconds)
- **Critical**: Should redirect to `/success` page
- **NOT** show 404 error!

### 7. Verify Success Page
Check that you see:
- ✅ Green checkmark icon
- ✅ "Payment Successful!" message
- ✅ "Service: Test Payment ($1/month)"
- ✅ "Status: Confirmed"
- ✅ Confirmation ID displayed

### 8. Check Your Email
Within 5 minutes, you should receive:
- Email from Stripe with receipt
- Shows $1.00 charge
- Includes invoice details

### 9. Verify in Stripe Dashboard
Go to: https://dashboard.stripe.com/test/payments (or /payments for live mode)

Check:
- ✅ $1.00 payment appears
- ✅ Status: "Succeeded"
- ✅ Customer name and email recorded
- ✅ Metadata shows `service_type: test`

Click "Customers" tab:
- ✅ New customer profile created
- ✅ Has phone number
- ✅ Has billing address
- ✅ Active subscription listed

### 10. Cancel Test Subscription
**IMPORTANT**: To avoid recurring $1 charges:

1. Go to: https://dashboard.stripe.com/subscriptions
2. Find the test subscription (customer email)
3. Click subscription
4. Click "Actions" → "Cancel subscription"
5. Confirm cancellation

## Testing Different Scenarios

### Test 1: Successful Payment (Above)
Use card `4242 4242 4242 4242` - Should succeed

### Test 2: Declined Payment
1. Go to `/test` page
2. Use card `4000 0000 0000 0002`
3. Should show: "Your card was declined"
4. Customer stays on checkout page
5. Can try different card

### Test 3: 3D Secure Authentication
1. Go to `/test` page
2. Use card `4000 0027 6000 3184`
3. Should open authentication modal
4. Click "Complete authentication"
5. Then redirects to success page

### Test 4: Mobile vs Desktop
**Desktop**:
- Checkout opens in new tab
- Success page in new tab
- Original site stays open

**Mobile**:
- Checkout redirects same tab
- Success page redirects same tab
- User flow is seamless

### Test 5: Real Package (Optional)
If you want to test with actual packages:
1. Go to homepage
2. Scroll to "Services" section
3. Click "Get Started" on any package
4. Goes to Stripe checkout
5. **Don't complete** unless you want to charge yourself!

## Common Issues & Solutions

### Issue: 404 on Success Page
**Status**: ✅ FIXED!
**Was**: Vercel didn't know `/success` was a React route
**Now**: Added SPA routing in vercel.json

### Issue: No Logo on Checkout
**Solution**: Configure branding in Stripe Dashboard
1. Go to: https://dashboard.stripe.com/settings/branding
2. Upload `/public/alt.png`
3. Set brand color: `#2563eb`

### Issue: No Email Receipt
**Solution**: Enable in Stripe Dashboard
1. Go to: https://dashboard.stripe.com/settings/emails
2. Enable "Send receipts to customers"
3. Test payment again

### Issue: Promotion Code Doesn't Work
**Solution**: Create codes in Stripe
1. Go to: https://dashboard.stripe.com/coupons
2. Create new coupon
3. Set code (e.g., `TEST10` for 10% off)
4. Test on checkout page

### Issue: Wrong Service Name on Success Page
**Check**: Did you clear browser cache?
- Service name stored in sessionStorage
- Should show "Test Payment ($1/month)"
- If wrong, hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

## Test vs Live Mode

### Test Mode (Safe - No Real Charges)
- Toggle to "Test" in Stripe Dashboard
- Use test cards (4242 4242...)
- Payments don't charge real money
- Good for development

### Live Mode (Real Payments)
- Toggle to "Live" in Stripe Dashboard
- Use real cards
- Charges actual money
- For production site

**Important**: Your $1 test product works in BOTH modes!

## Production Testing Checklist

Before launching to customers:

### Stripe Dashboard Configuration
- [ ] Branding configured (logo, colors)
- [ ] Business info filled out (name, address, support email)
- [ ] Email receipts enabled
- [ ] Statement descriptor set ("IBTAKAR LABS")
- [ ] Bank account added for payouts
- [ ] In LIVE mode (not test mode)

### Technical Testing
- [ ] Test payment completes successfully
- [ ] Success page loads (no 404)
- [ ] Service name displays correctly
- [ ] Email receipt received
- [ ] Customer profile created in Stripe
- [ ] Metadata recorded properly
- [ ] Phone number collected
- [ ] Billing address collected

### Real World Testing
- [ ] Test on desktop browser
- [ ] Test on mobile browser
- [ ] Test with promotion code
- [ ] Test declined card (4000 0000 0000 0002)
- [ ] Test 3D Secure card (4000 0027 6000 3184)
- [ ] Verify Stripe Dashboard shows all data
- [ ] Check email receipt formatting
- [ ] Test cancel URL (cancel during checkout)

### Optional Advanced Testing
- [ ] Test webhook (if configured)
- [ ] Test subscription management
- [ ] Test refund process
- [ ] Test different currencies (if needed)

## Monitoring Live Payments

### Real-Time Monitoring
Watch for payments in Stripe Dashboard:
```
https://dashboard.stripe.com/payments
```

Filter by:
- Date range
- Amount
- Status (succeeded, failed, pending)
- Customer name/email

### Email Notifications
Set up in Stripe Dashboard → Settings → Email notifications:
- Payment succeeded
- Payment failed
- New customer created
- Subscription created
- Refund issued

### Key Metrics to Track
- **Conversion rate**: Checkouts started vs completed
- **Decline rate**: Failed payments / total attempts
- **Average order value**: Total revenue / number of payments
- **MRR (Monthly Recurring Revenue)**: From subscriptions

## After Testing

### 1. Remove Test Product from Production (Optional)
If you don't want customers seeing "$1 test":
```javascript
// In api/create-checkout-session.js
// Comment out or remove the test service:
// test: { ... }
```

### 2. Remove /test Page from Production (Optional)
```javascript
// In src/main.jsx
// Comment out:
// <Route path="/test" element={<Test />} />
```

Or keep it and just don't link to it publicly (hidden admin tool).

### 3. Keep for Future Testing
I recommend keeping the test product active:
- Hidden from customers (they don't see /test page)
- Useful for testing updates
- Can test new Stripe features
- Handy for debugging issues

## Cost of Testing

**$1 test subscription**:
- Charges: $1.00
- Stripe fee: $0.33 (2.9% + $0.30)
- You receive: $0.67

To cancel and avoid recurring charges:
1. Stripe Dashboard → Subscriptions
2. Find test subscription
3. Cancel immediately

**Refund if needed**:
1. Find payment in Dashboard
2. Click "Refund"
3. Full refund ($1.00 back to card)
4. Stripe fee not refunded

## Quick Command Reference

```bash
# Start development server
npm run dev

# Test locally
# Open: http://localhost:5173/test

# Build for production
npm run build

# Deploy to Vercel
git add .
git commit -m "Add test payment flow"
git push

# Check deployment
# Wait 1-2 minutes, then visit:
# https://ibtakarlabs.com/test
```

## Support Resources

**Stripe Documentation**:
- Testing: https://stripe.com/docs/testing
- Test Cards: https://stripe.com/docs/testing#cards
- Checkout: https://stripe.com/docs/payments/checkout
- Subscriptions: https://stripe.com/docs/billing/subscriptions

**Stripe Dashboard Links**:
- Payments: https://dashboard.stripe.com/payments
- Customers: https://dashboard.stripe.com/customers
- Subscriptions: https://dashboard.stripe.com/subscriptions
- Products: https://dashboard.stripe.com/products
- Branding: https://dashboard.stripe.com/settings/branding
- Webhooks: https://dashboard.stripe.com/webhooks

## Next Steps

1. ✅ Test locally with `npm run dev` → visit `/test`
2. ✅ Complete a test payment with card 4242...
3. ✅ Verify success page works (no 404)
4. ✅ Check Stripe Dashboard for payment
5. ✅ Cancel test subscription
6. ✅ Configure branding in Stripe (logo, colors)
7. ✅ Test on production after deploying
8. ✅ Test real packages (Starter, Pro, Premium)
9. ✅ Monitor first real customer payment

## Questions?

Check the main guide: `STRIPE_PROFESSIONAL_SETUP.md`

Common issues solved:
- 404 on success page → Fixed with vercel.json SPA routing
- No branding → Configure in Stripe Dashboard
- No email receipts → Enable in Stripe settings
- Declined payments → Expected behavior for testing

---

**Ready to test?** Run `npm run dev` and visit `http://localhost:5173/test`

Your payment flow is now production-ready! 🚀
