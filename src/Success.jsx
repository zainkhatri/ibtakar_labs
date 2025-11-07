import { useEffect, useState } from 'react';
import './App.css';

function Success() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    setSessionId(sessionId);
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
              <a href="https://calendly.com/zainnkhatri/30min" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                Schedule a Call
              </a>
            </div>

            <div className="success-return">
              <a href="/" target="_blank" rel="noopener noreferrer" className="return-link">← Return to Homepage</a>
            </div>

            {sessionId && (
              <div className="session-info">
                <small>Session ID: {sessionId}</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Success;
