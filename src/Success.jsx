import { useEffect, useState } from 'react';
import './App.css';

// Mobile detection utility
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.innerWidth <= 768);
};

// Handle link navigation - redirect on mobile, open new tab on desktop
const handleLinkClick = (e, url) => {
  if (isMobileDevice()) {
    e.preventDefault();
    window.location.href = url;
  }
  // On desktop, let the default behavior (target="_blank") work
};

// Service names mapping
const serviceNames = {
  starter: 'Starter Website Package',
  pro: 'Pro Website Package',
  premium: 'Premium Website Package',
  managed: 'Managed Web Plan (Monthly)',
  test: 'Test Payment ($1/month)'
};

function Success() {
  const [sessionId, setSessionId] = useState(null);
  const [serviceName, setServiceName] = useState('Website Package');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    setSessionId(sessionId);

    // Try to get service type from referrer or session storage
    const serviceType = sessionStorage.getItem('checkout_service_type');
    if (serviceType && serviceNames[serviceType]) {
      setServiceName(serviceNames[serviceType]);
      sessionStorage.removeItem('checkout_service_type'); // Clean up
    }
  }, []);

  return (
    <div className="app">
      <div className="success-page">
        <div className="container">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h1 className="success-title">Payment Successful!</h1>
            <p className="success-message">
              Thank you for choosing Ibtakar Labs! Your payment has been processed successfully.
            </p>

            <div className="order-summary">
              <h3>Order Summary</h3>
              <p><strong>Service:</strong> {serviceName}</p>
              <p><strong>Status:</strong> <span className="status-confirmed">Confirmed</span></p>
              {sessionId && (
                <p><small>Confirmation ID: {sessionId.substring(0, 20)}...</small></p>
              )}
            </div>
            
            <div className="success-details">
              <h3>What happens next?</h3>
              <ul>
                <li>You'll receive a confirmation email within 5 minutes</li>
                <li>I'll contact you within 24 hours to discuss your project details</li>
                <li>We'll schedule a kick-off call to get started</li>
                <li>Your website development will begin immediately</li>
              </ul>
            </div>

            <div className="success-contact">
              <p>Questions? Contact me directly:</p>
              <a href="mailto:zainnkhatri@gmail.com" className="btn btn-primary">
                Email Me
              </a>
              <a
                href="https://calendly.com/zainnkhatri/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                onClick={(e) => handleLinkClick(e, 'https://calendly.com/zainnkhatri/30min')}
              >
                Schedule a Call
              </a>
            </div>

            <div className="success-return">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="return-link"
                onClick={(e) => handleLinkClick(e, '/')}
              >
                ← Return to Homepage
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Success;
