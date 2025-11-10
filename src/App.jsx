import { useState, useEffect } from 'react'
import { database } from './firebase'
import { ref, push, onValue, query, orderByChild } from 'firebase/database'
import { createCheckoutSession } from './stripe'
import './App.css'

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

function App() {
  // Disable scroll restoration immediately
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  const [activeProject, setActiveProject] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    company: '',
    text: '',
    rating: 5
  });
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  // Profanity filter - basic word list (you can expand this)
  const profanityList = [
    'damn', 'hell', 'shit', 'fuck', 'bitch', 'ass', 'bastard', 'crap',
    'piss', 'dick', 'cock', 'pussy', 'whore', 'slut', 'fag', 'nigger',
    'retard', 'stupid', 'idiot', 'moron', 'dumb', 'suck', 'sucks'
  ];

  const containsProfanity = (text) => {
    const lowerText = text.toLowerCase();
    return profanityList.some(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(lowerText);
    });
  };

  useEffect(() => {
    // Reset scroll position on page load
    window.history.scrollRestoration = 'manual';
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    // Smooth scroll behavior for anchor links on mobile
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target) {
        const href = target.getAttribute('href');
        if (href && href !== '#') {
          e.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            const isMobile = window.innerWidth <= 768;
            const offset = isMobile ? 65 : 70;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'auto'
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  const portfolioItems = [
    {
      name: "Interactive App",
      url: "https://meetyourmaker.vercel.app",
      description: "Interactive web application with dynamic features",
      category: "Web App",
      tier: "Premium"
    },
    {
      name: "Restaurant Website",
      url: "https://bholatskitchen.com",
      description: "Full-featured restaurant website with ordering",
      category: "E-commerce",
      tier: "Pro"
    },
    {
      name: "Organization Site",
      url: "https://mtcucsd.org",
      description: "Professional organization platform",
      category: "Organization",
      tier: "Starter"
    },
    {
      name: "Professional Portfolio",
      url: "https://tsharifi.com",
      description: "Elegant professional portfolio",
      category: "Portfolio",
      tier: "Starter"
    },
    {
      name: "Portfolio Site",
      url: "https://zainkhatri.com",
      description: "Personal portfolio showcasing web development mastery",
      category: "Portfolio",
      tier: "Premium"
    }
  ];

  const services = [
    {
      name: "Starter Website",
      price: "$999",
      delivery: "1 week",
      stripeType: "starter",
      description: "Perfect for small businesses establishing an online presence.",
      features: [
        "3 pages (Home, About, Contact)",
        "Mobile-friendly design",
        "Contact form",
        "Basic SEO setup",
        "Fast loading speed"
      ]
    },
    {
      name: "Pro Website",
      price: "$1,999",
      delivery: "2 weeks",
      stripeType: "pro",
      description: "For growing businesses ready to make an impact.",
      features: [
        "Up to 7 custom pages",
        "Unique brand design",
        "Smooth animations",
        "Booking OR store (20 products)",
        "Blog with easy updates",
        "Google Analytics",
        "Advanced SEO"
      ],
      popular: true
    },
    {
      name: "Premium Website",
      price: "$3,999+",
      delivery: "3-4 weeks",
      stripeType: "premium",
      description: "Enterprise solution for ambitious businesses.",
      features: [
        "Everything in Pro +",
        "Unlimited pages",
        "User accounts & login",
        "Custom database",
        "API & integrations",
        "Email automation",
        "Payment processing"
      ]
    }
  ];


  // Load reviews from Firebase on component mount
  useEffect(() => {
    const reviewsRef = ref(database, 'reviews');
    const reviewsQuery = query(reviewsRef, orderByChild('rating'));
    
    const unsubscribe = onValue(reviewsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reviewsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        
        // Only show reviews with 4.5+ stars and no profanity
        const highRatedReviews = reviewsArray.filter(review => 
          review.rating >= 4.5 && 
          !containsProfanity(review.text) && 
          !containsProfanity(review.name) &&
          review.approved !== false
        );
        
        // Sort by date (newest first)
        highRatedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setReviews(highRatedReviews);
      } else {
        setReviews([]);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Check for profanity
      if (containsProfanity(newReview.text) || containsProfanity(newReview.name)) {
        alert('Please keep your review professional. Inappropriate language is not allowed.');
        setIsSubmitting(false);
        return;
      }

      // Only accept reviews with 4.5+ stars
      if (newReview.rating < 4.5) {
        alert('Thank you for your feedback! We only display reviews of 4.5 stars and above.');
        setIsSubmitting(false);
        return;
      }

      const reviewToAdd = {
        ...newReview,
        createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        approved: true
      };

      // Add review to Firebase
      const reviewsRef = ref(database, 'reviews');
      await push(reviewsRef, reviewToAdd);
      
      // Reset form
      setNewReview({ name: '', role: '', company: '', text: '', rating: 5 });
      setShowReviewForm(false);
      
      alert('Thank you for your review! It has been submitted successfully.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('There was an error submitting your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    return stars;
  };

  const handleCheckout = async (serviceType) => {
    setCheckoutLoading(serviceType);
    try {
      await createCheckoutSession(serviceType);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your request. Please try again or contact us directly.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <div className="nav-brand">
            <div className="brand-logo">
              <img src="/alt.png" alt="Ibtakar Labs" className="logo-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-name">Ibtakar Labs</span>
              <span className="brand-tagline">Web Development</span>
            </div>
          </div>
          <div className="nav-links">
            <a href="#services" className="nav-link">Services</a>
            <a href="#founder" className="nav-link">About</a>
            <a href="#portfolio" className="nav-link">Portfolio</a>
            <a href="#testimonials" className="nav-link">Testimonials</a>
            <a href="#contact" className="nav-link">Contact</a>
            <a
              href="https://calendly.com/zainnkhatri/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-small"
              onClick={(e) => handleLinkClick(e, 'https://calendly.com/zainnkhatri/30min')}
            >
              Book Consultation
            </a>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          
          {/* Mobile Menu */}
          <div 
            className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setMobileMenuOpen(false);
              }
            }}
          >
            <a href="#services" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#founder" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#portfolio" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Portfolio</a>
            <a href="#testimonials" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
            <a href="#contact" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <a
              href="https://calendly.com/zainnkhatri/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mobile-cta-btn"
              onClick={(e) => {
                handleLinkClick(e, 'https://calendly.com/zainnkhatri/30min');
                setMobileMenuOpen(false);
              }}
            >
              Book Consultation
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero" aria-label="Hero section">
        <div className="container">
          <h1 className="hero-title">Professional Website Development</h1>
          <p className="hero-subtitle">
            Custom websites built for small businesses. Designed to help you look professional and attract more customers online.
          </p>
          <div className="hero-cta">
            <a
              href="https://calendly.com/zainnkhatri/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              onClick={(e) => handleLinkClick(e, 'https://calendly.com/zainnkhatri/30min')}
            >
              Schedule Consultation
            </a>
            <a href="#portfolio" className="btn btn-secondary">
              View Portfolio
            </a>
          </div>
        </div>
      </header>


      {/* Services Section */}
      <section className="services" id="services" aria-labelledby="services-heading">
        <div className="container">
          <h2 id="services-heading" className="section-title">Web Development Services & Pricing</h2>
          <p className="section-subtitle">
            Choose the perfect website package for your business. All packages include mobile-responsive design, fast loading speeds, and SEO optimization. Transparent pricing with no hidden fees.
          </p>

          <div className="services-grid" role="list" aria-label="Website development service packages">
            {services.map((service, index) => (
              <article
                key={index}
                className={`service-card ${service.popular ? 'popular' : ''}`}
                role="listitem"
                itemScope
                itemType="https://schema.org/Service"
              >
                {service.popular && <div className="popular-badge">Most Popular</div>}
                <h3 className="service-name" itemProp="name">{service.name}</h3>
                <div className="service-price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <span itemProp="price">{service.price}</span>
                </div>
                <div className="service-delivery">Delivery: {service.delivery}</div>
                {service.description && (
                  <p className="service-description">{service.description}</p>
                )}
                <ul className="service-features" itemProp="description">
                  {service.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(service.stripeType)}
                  disabled={checkoutLoading === service.stripeType}
                  className="btn btn-outline"
                  aria-label={`Get started with ${service.name} package`}
                >
                  {checkoutLoading === service.stripeType ? 'Processing...' : 'Get Started'}
                </button>
              </article>
            ))}
          </div>

          <div className="managed-plan">
            <div>
              <h3>Managed Web Plan (Required)</h3>
              <p className="managed-price">$50/month</p>
            </div>
            <p>Includes managed hosting, SSL certificates, domain renewal, security updates, content updates & revisions, technical support, performance monitoring, and email support within 2 business days.</p>
            <button
              onClick={() => handleCheckout('managed')}
              disabled={checkoutLoading === 'managed'}
              className="btn btn-outline managed-plan-btn"
            >
              {checkoutLoading === 'managed' ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="founder" id="founder" aria-labelledby="founder-heading">
        <div className="container">
          <h2 id="founder-heading" className="section-title">Meet the Founder</h2>

          <div className="founder-content" itemScope itemType="https://schema.org/Person">
            <div className="founder-image">
              <img src="/founder.jpeg" alt="Zain Khatri - NASA Engineer and Professional Web Developer" itemProp="image" />
            </div>
            <div className="founder-info">
              <h3 className="founder-name" itemProp="name">Zain Khatri</h3>
              <p className="founder-title" itemProp="jobTitle">NASA Engineer</p>

              <div className="founder-bio">
                <p>
                  With years of experience in web development and a passion for creating
                  exceptional digital experiences, I founded Ibtakar Labs to help businesses
                  establish their online presence with professional, high-performance websites.
                </p>
                <p>
                  Every project is an opportunity to blend cutting-edge technology with
                  thoughtful design. I work closely with each client to understand their
                  unique needs and deliver solutions that exceed expectations.
                </p>
              </div>

              <div className="founder-logos">
                <img src="/nasa.png" alt="NASA - National Aeronautics and Space Administration" className="company-logo" />
                <img src="/logo-ucberkeley.png" alt="UC Berkeley - University of California Berkeley" className="company-logo" />
                <img src="/ucsd.png" alt="UC San Diego - University of California San Diego" className="company-logo" />
              </div>

              <div className="founder-stats">
                <div className="stat">
                  <div className="stat-number">20+</div>
                  <div className="stat-label">Projects Completed</div>
                </div>
                <div className="stat">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Client Satisfaction</div>
                </div>
                <div className="stat">
                  <div className="stat-number">3+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
              </div>

              <a
                href="https://zainkhatri.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                onClick={(e) => handleLinkClick(e, 'https://zainkhatri.com')}
              >
                View Full Portfolio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="portfolio" id="portfolio" aria-labelledby="portfolio-heading">
        <div className="container portfolio-container">
          <h2 id="portfolio-heading" className="section-title">Web Development Portfolio</h2>
          <p className="section-subtitle">
            Explore live examples of professional websites including e-commerce, portfolios, and business sites. Real projects for real clients.
          </p>

          <div className="portfolio-showcase">
            <div className="portfolio-viewer">
              <div className="viewer-header">
                <div className="portfolio-navigation">
                  {portfolioItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setActiveProject(index);
                        setIframeLoading(true);
                      }}
                      className={`portfolio-tab ${activeProject === index ? 'active' : ''}`}
                    >
                      <span className="tab-category">{item.category}</span>
                      <span className="tab-name">{item.name}</span>
                    </button>
                  ))}
                </div>
                <div className="viewer-info">
                  <div className="viewer-info-row">
                    <p className="viewer-description">{portfolioItems[activeProject].description}</p>
                    <span className={`portfolio-tier-badge tier-${portfolioItems[activeProject].tier.toLowerCase()}`}>
                      {portfolioItems[activeProject].tier} Tier
                    </span>
                  </div>
                  <a
                    href={portfolioItems[activeProject].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="viewer-link"
                    onClick={(e) => handleLinkClick(e, portfolioItems[activeProject].url)}
                  >
                    Visit Live Site →
                  </a>
                </div>
              </div>
              <div className="iframe-container">
                <iframe
                  src={portfolioItems[activeProject].url}
                  title={portfolioItems[activeProject].name}
                  className={`portfolio-iframe ${iframeLoading ? 'loading' : ''}`}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  onLoad={() => setIframeLoading(false)}
                  onError={() => setIframeLoading(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="testimonials" id="testimonials" aria-labelledby="testimonials-heading">
        <div className="container">
          <h2 id="testimonials-heading" className="section-title">Client Reviews & Testimonials</h2>
          <p className="section-subtitle">
            5-star rated web development services. Read reviews from satisfied clients who trusted us with their websites.
          </p>

          <div className="reviews-container">
            <div className="reviews-header">
              <button 
                className="btn btn-outline add-review-btn"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? 'Cancel' : 'Leave a Review'}
              </button>
            </div>


            {showReviewForm && (
              <div className="review-form-container">
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={newReview.name}
                      onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                      required
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Your Role"
                      value={newReview.role}
                      onChange={(e) => setNewReview({...newReview, role: e.target.value})}
                      required
                      className="form-input"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={newReview.company}
                    onChange={(e) => setNewReview({...newReview, company: e.target.value})}
                    required
                    className="form-input"
                  />
                  <textarea
                    placeholder="Share your experience..."
                    value={newReview.text}
                    onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                    required
                    className="form-textarea"
                    rows="4"
                  />
                  <div className="rating-input">
                    <label>Rating:</label>
                    <select 
                      value={newReview.rating}
                      onChange={(e) => setNewReview({...newReview, rating: parseFloat(e.target.value)})}
                      className="form-select"
                    >
                      <option value={5}>5 Stars - Excellent</option>
                      <option value={4.5}>4.5 Stars - Very Good</option>
                      <option value={4}>4 Stars - Good</option>
                      <option value={3.5}>3.5 Stars - Fair</option>
                      <option value={3}>3 Stars - Average</option>
                      <option value={2.5}>2.5 Stars - Below Average</option>
                      <option value={2}>2 Stars - Poor</option>
                      <option value={1.5}>1.5 Stars - Very Poor</option>
                      <option value={1}>1 Star - Terrible</option>
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary submit-review-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="no-reviews-message">
                <p>Be the first to leave a review! Share your experience working with Ibtakar Labs.</p>
              </div>
            ) : (
              <div className="testimonials-grid" role="list" aria-label="Client testimonials and reviews">
                {reviews.map((review) => (
                  <article key={review.id} className="testimonial-card" role="listitem" itemScope itemType="https://schema.org/Review">
                    <div className="testimonial-quote">"</div>
                    <div className="review-rating" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                      <meta itemProp="ratingValue" content={review.rating} />
                      <meta itemProp="bestRating" content="5" />
                      {renderStars(review.rating)}
                    </div>
                    <p className="testimonial-text" itemProp="reviewBody">{review.text}</p>
                    <div className="testimonial-author" itemProp="author" itemScope itemType="https://schema.org/Person">
                      <div className="author-info">
                        <div className="author-name" itemProp="name">{review.name}</div>
                        <div className="author-role" itemProp="jobTitle">{review.role}</div>
                        <div className="author-company" itemProp="worksFor">{review.company}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact" aria-labelledby="contact-heading">
        <div className="container">
          <h2 id="contact-heading" className="section-title">Let's Work Together</h2>
          <p className="contact-text">
            Schedule a 30-minute consultation to discuss your website project. Get expert advice on web development, pricing, and timeline.
          </p>
          <a
            href="https://calendly.com/zainnkhatri/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-large"
            onClick={(e) => handleLinkClick(e, 'https://calendly.com/zainnkhatri/30min')}
          >
            Schedule a Consultation
          </a>
          <div className="contact-info">
            <p>Visit <a href="https://zainkhatri.com" target="_blank" rel="noopener noreferrer" onClick={(e) => handleLinkClick(e, 'https://zainkhatri.com')}>zainkhatri.com</a></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Ibtakar Labs. Professional Website Development Services.</p>
          <p>
            <a href="https://zainkhatri.com" target="_blank" rel="noopener noreferrer" onClick={(e) => handleLinkClick(e, 'https://zainkhatri.com')}>zainkhatri.com</a>
            {' • '}
            <a href="https://calendly.com/zainnkhatri/30min" target="_blank" rel="noopener noreferrer" onClick={(e) => handleLinkClick(e, 'https://calendly.com/zainnkhatri/30min')}>Schedule Meeting</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
