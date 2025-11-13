import { createCheckoutSession } from './stripe';
import './App.css';

function Test() {
  const handleTestPayment = async () => {
    try {
      await createCheckoutSession('test');
    } catch (error) {
      console.error('Test payment error:', error);
      alert('Error starting test payment. Check console for details.');
    }
  };

  return (
    <div className="app">
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Payment Testing Page</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
          Test the complete payment flow with a real $1 charge
        </p>

        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#856404' }}>⚠️ Warning: Real Payment</h3>
          <p style={{ color: '#856404', marginBottom: '0.5rem' }}>
            This will charge your card <strong>$1.00/month</strong> as a subscription.
          </p>
          <p style={{ color: '#856404', fontSize: '0.9rem' }}>
            Cancel the subscription in Stripe Dashboard after testing to avoid future charges.
          </p>
        </div>

        <div style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
          textAlign: 'left'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>What Gets Tested:</h3>
          <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>✅ Stripe checkout page with your branding</li>
            <li>✅ Phone number collection</li>
            <li>✅ Billing address collection</li>
            <li>✅ Promotion code entry (if you created codes)</li>
            <li>✅ Payment processing</li>
            <li>✅ Redirect to success page (no 404!)</li>
            <li>✅ Success page shows service name</li>
            <li>✅ Email receipt from Stripe</li>
            <li>✅ Customer profile created in Stripe</li>
          </ul>
        </div>

        <div style={{
          background: '#e7f3ff',
          border: '1px solid #007bff',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem',
          textAlign: 'left'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#004085' }}>Test Cards</h3>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Success:</strong> 4242 4242 4242 4242
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Decline:</strong> 4000 0000 0000 0002
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Requires 3D Secure:</strong> 4000 0027 6000 3184
          </p>
          <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '1rem' }}>
            Use any future date for expiry, any 3-digit CVC, any ZIP code.
          </p>
        </div>

        <button
          onClick={handleTestPayment}
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            marginBottom: '2rem'
          }}
        >
          Start $1 Test Payment
        </button>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <h4 style={{ marginBottom: '0.5rem' }}>After Testing:</h4>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Go to <a href="https://dashboard.stripe.com/subscriptions" target="_blank" rel="noopener noreferrer">
              Stripe Dashboard → Subscriptions
            </a> and cancel the test subscription to avoid recurring charges.
          </p>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <a
            href="/"
            style={{ color: '#2563eb', textDecoration: 'none', fontSize: '1rem' }}
          >
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}

export default Test;
