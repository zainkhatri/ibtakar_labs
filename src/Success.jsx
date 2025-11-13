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
    <div className="app" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Success Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          {/* Success Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            fontSize: '40px'
          }}>
            ✓
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Payment Successful!
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            marginBottom: '2.5rem',
            lineHeight: '1.6'
          }}>
            Thank you for choosing Ibtakar Labs! Your payment has been processed successfully.
          </p>

          {/* Order Summary Card */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '15px',
            padding: '2rem',
            marginBottom: '2.5rem',
            textAlign: 'left',
            color: 'white'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: 'white'
            }}>
              Order Summary
            </h3>

            <div style={{
              display: 'grid',
              gap: '1rem',
              fontSize: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.9 }}>Service:</span>
                <strong style={{ textAlign: 'right' }}>{serviceName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.9 }}>Status:</span>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  ✓ Confirmed
                </div>
              </div>

              {sessionId && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  opacity: 0.8,
                  wordBreak: 'break-all'
                }}>
                  Confirmation ID: {sessionId.substring(0, 25)}...
                </div>
              )}
            </div>
          </div>

          {/* What's Next Section */}
          <div style={{
            textAlign: 'left',
            marginBottom: '2.5rem'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#1e293b'
            }}>
              What Happens Next?
            </h3>

            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {[
                { icon: '📧', text: "You'll receive a confirmation email within 5 minutes" },
                { icon: '📞', text: "I'll contact you within 24 hours to discuss your project" },
                { icon: '📅', text: "We'll schedule a kick-off call to get started" },
                { icon: '🚀', text: "Your website development will begin immediately" }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    minWidth: '30px'
                  }}>
                    {item.icon}
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#475569',
                    fontSize: '1rem',
                    lineHeight: '1.6'
                  }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}>
            <a
              href="mailto:zainnkhatri@gmail.com"
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'inline-block',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              📧 Email Me
            </a>

            <a
              href="https://calendly.com/zainnkhatri/30min"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleLinkClick(e, 'https://calendly.com/zainnkhatri/30min')}
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '1rem 2rem',
                background: 'white',
                color: '#667eea',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '1rem',
                border: '2px solid #667eea',
                transition: 'all 0.2s',
                display: 'inline-block',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#667eea';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📅 Schedule a Call
            </a>
          </div>

          {/* Return Home Link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleLinkClick(e, '/')}
            style={{
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#667eea'}
            onMouseLeave={(e) => e.target.style.color = '#64748b'}
          >
            ← Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}

export default Success;
