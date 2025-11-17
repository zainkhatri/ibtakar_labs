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
    price: "$999",
    description: "3 simple pages, basic template design, mobile responsive, contact form, SEO optimization"
  },
  pro: {
    name: "Pro Website",
    price: "$1,999",
    description: "Custom visual design & branding, up to 5 dynamic pages, advanced React animations, e-commerce/booking system, content management dashboard, advanced SEO & analytics, performance optimization, Google Analytics integration"
  },
  premium: {
    name: "Premium Website",
    price: "$3,999+",
    description: "Everything in Pro + custom database & API, email automation & marketing, social media integration, payment gateway integration, multi-language support, advanced integrations"
  },
  managed: {
    name: "Managed Web Plan",
    price: "$22/month",
    description: "Covers everything your website needs to stay fast, secure, and updated. Includes hosting, domain renewal, SSL certificates, security patches, content updates, performance monitoring, bug fixes, and priority support."
  },
  studentPortfolio: {
    name: "Student Portfolio Special",
    price: "$200",
    description: "A clean, professional portfolio built specifically for students. Modern single-page site that shows off your projects, skills, and experience. Fast turnaround, mobile-friendly, and designed to help you stand out for internships, jobs, or grad school."
  },
  test: {
    name: "Test Payment",
    price: "$1/month",
    description: "⚠️ FOR TESTING ONLY - Test the payment flow with a real $1 charge. You can cancel anytime from Stripe dashboard."
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

    // Store service type for success page
    sessionStorage.setItem('checkout_service_type', serviceType);

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
    const calendlyUrl = `https://calendly.com/ibtakarlabs/30min?utm_source=${serviceType}_package&utm_medium=website&utm_campaign=get_started`;
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
