import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Mobile detection utility
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768);
};

// Service packages
export const stripeServices = {
  starter: {
    name: "Starter Website",
    price: "$999.99",
    description: "3 simple pages, basic template design, mobile responsive, contact form, SEO optimization"
  },
  pro: {
    name: "Pro Website",
    price: "$1,999.99",
    description: "Custom visual design & branding, up to 5 dynamic pages, advanced React animations, e-commerce/booking system, content management dashboard, advanced SEO & analytics, performance optimization, Google Analytics integration"
  },
  premium: {
    name: "Premium Website",
    price: "$3,999.99+",
    description: "Everything in Pro + custom database & API, email automation & marketing, social media integration, payment gateway integration, multi-language support, advanced integrations"
  },
  managed: {
    name: "Managed Web Plan",
    price: "$50/month",
    description: "Managed hosting, SSL certificates, domain renewal, security updates, content updates & revisions, technical support, performance monitoring, email support"
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
      if (isMobileDevice()) {
        console.log('Stripe session created, redirecting on mobile:', data.url);
        window.location.href = data.url;
      } else {
        console.log('Stripe session created, opening in new tab:', data.url);
        window.open(data.url, '_blank');
      }
      return;
    } else {
      const errorText = await response.text();
      console.error('API error response:', response.status, errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
  } catch (error) {
    console.error('Error creating checkout session:', error);

    // Fallback to Calendly for any Stripe errors
    const calendlyUrl = `https://calendly.com/zainnkhatri/30min?utm_source=${serviceType}_package&utm_medium=website&utm_campaign=get_started`;
    if (isMobileDevice()) {
      console.log('Stripe not available, redirecting to Calendly on mobile for consultation');
      window.location.href = calendlyUrl;
    } else {
      console.log('Stripe not available, opening Calendly in new tab for consultation');
      window.open(calendlyUrl, '_blank');
    }
  }
};

export default stripePromise;
