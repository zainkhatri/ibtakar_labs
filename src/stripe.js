import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Service packages
export const stripeServices = {
  starter: {
    name: "Starter Website",
    price: "$1,200",
    description: "3 simple pages, basic template design, mobile responsive, contact form, SEO optimization"
  },
  pro: {
    name: "Pro Website", 
    price: "$2,400",
    description: "Custom visual design & branding, up to 5 dynamic pages, advanced React animations, e-commerce/booking system, content management dashboard, advanced SEO & analytics, performance optimization, Google Analytics integration"
  },
  premium: {
    name: "Premium Website",
    price: "$4,000+",
    description: "Everything in Pro + custom database & API, email automation & marketing, social media integration, payment gateway integration, multi-language support, advanced integrations"
  }
};

// Create Stripe Checkout Session
export const createCheckoutSession = async (serviceType) => {
  const service = stripeServices[serviceType];
  
  if (!service) {
    throw new Error('Invalid service type');
  }

  try {
    console.log('Attempting to create Stripe checkout session for:', serviceType);
    
    // Try to call our backend API first
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceType: serviceType
      }),
    });

    console.log('API response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Stripe session created, redirecting to:', data.url);
      window.location.href = data.url;
      return;
    } else {
      const errorText = await response.text();
      console.error('API error response:', response.status, errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Only fallback to Calendly if we explicitly want to
    if (error.message.includes('404') || error.message.includes('Failed to fetch')) {
      console.log('API not available, falling back to Calendly');
      const calendlyUrl = `https://calendly.com/zainnkhatri/30min?utm_source=${serviceType}_package&utm_medium=website&utm_campaign=get_started`;
      window.open(calendlyUrl, '_blank');
    } else {
      // For other errors, show user-friendly message
      alert('There was an error processing your payment. Please try again or contact us directly.');
    }
  }
};

export default stripePromise;
