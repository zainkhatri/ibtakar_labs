import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { database } from './firebase'
import { ref, push, onValue, query, orderByChild } from 'firebase/database'
import { createCheckoutSession } from './stripe'
import { SparklesText } from './components/ui/SparklesText'
import { TestimonialMarquee } from './components/TestimonialMarquee'
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

  const navigate = useNavigate();
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

  // Detect if user is on mobile
  const isMobile = useMemo(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }, []);

  // Memoize scroll handler with throttling (optimized for mobile)
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);
  }, []);

  // Memoize resize handler with debouncing
  const handleResize = useCallback(() => {
    if (window.innerWidth > 768 && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [mobileMenuOpen]);

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

    // Throttle scroll handler (more aggressive throttle on mobile for better performance)
    let scrollTimeout;
    const throttleDelay = isMobile ? 32 : 16; // 30fps on mobile, 60fps on desktop
    const throttledScroll = () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          handleScroll();
          scrollTimeout = null;
        }, throttleDelay);
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
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', handleResize);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [mobileMenuOpen, handleScroll, handleResize, isMobile]);

  const portfolioItems = [
    {
      name: "American Horizon Medical",
      url: "https://www.ahorizonmedical.com",
      description: "Professional healthcare practice website with patient portal and digital engagement",
      category: "Healthcare",
      tier: "Premium"
    },
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
      price: "$500",
      priceNote: "includes 1st month",
      monthly: "then $20/mo",
      delivery: "1 week",
      stripeType: "starter",
      description: "Perfect for small businesses establishing an online presence.",
      features: [
        "3 pages (Home, About, Contact)",
        "Mobile-friendly design",
        "Contact form",
        "Basic SEO setup",
        "Fast loading speed",
        "Managed hosting & support"
      ]
    },
    {
      name: "Pro Website",
      price: "$1,000",
      priceNote: "includes 1st month",
      monthly: "then $20/mo",
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
        "Advanced SEO",
        "Managed hosting & support"
      ],
      popular: true
    },
    {
      name: "Premium Website",
      price: "$2,000+",
      priceNote: "includes 1st month",
      monthly: "then $50/mo",
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
        "Payment processing",
        "Premium hosting & support"
      ]
    }
  ];


  // Memoize profanity check function
  const checkProfanity = useCallback((text) => {
    return containsProfanity(text);
  }, []);

  // Load reviews from Firebase on component mount with caching
  useEffect(() => {
    // Check for cached reviews first
    const cachedReviews = sessionStorage.getItem('cached_reviews');
    const cacheTimestamp = sessionStorage.getItem('cache_timestamp');
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    if (cachedReviews && cacheTimestamp) {
      const age = Date.now() - parseInt(cacheTimestamp);
      if (age < CACHE_DURATION) {
        setReviews(JSON.parse(cachedReviews));
        return;
      }
    }

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
          !checkProfanity(review.text) &&
          !checkProfanity(review.name) &&
          review.approved !== false
        );

        // Sort by date (newest first)
        highRatedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Cache the results
        sessionStorage.setItem('cached_reviews', JSON.stringify(highRatedReviews));
        sessionStorage.setItem('cache_timestamp', Date.now().toString());

        setReviews(highRatedReviews);
      } else {
        setReviews([]);
      }
    }, {
      // Use onlyOnce option to avoid unnecessary re-renders
      onlyOnce: false
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [checkProfanity]);

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


  // Memoize render stars function
  const renderStars = useCallback((rating) => {
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
  }, []);

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
              <img
                src="/alt.png"
                alt="Ibtakar Labs"
                className="logo-icon"
                fetchPriority="high"
                decoding="async"
              />
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
              href="mailto:ibtakarlabs@gmail.com?subject=Website Development Inquiry"
              className="btn btn-primary mobile-cta-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero" aria-label="Hero section">
        <div className="container">
          <h1 className="hero-title">
            Crafting <SparklesText
              text="Exceptional"
              colors={{ first: '#7FB0A3', second: '#C5E5DB' }}
              sparklesCount={isMobile ? 8 : 15}
              style={{
                fontStyle: 'italic',
                color: '#C5E5DB',
              }}
            /> Digital Experiences
          </h1>
          <p className="hero-subtitle">
            Professional websites designed to help your business succeed. Built with modern technology, optimized for results.
          </p>
          <div className="hero-cta">
            <a
              href="mailto:ibtakarlabs@gmail.com?subject=Website Development Inquiry"
              className="btn btn-primary"
            >
              Get in Touch
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
                  <span className="price-note">{service.priceNote}</span>
                  <span className="monthly-price">{service.monthly}</span>
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
            <div className="managed-plan-header">
              <h3>Student Portfolio Special</h3>
              <div className="managed-plan-pricing">
                <span className="managed-price">$200</span>
                <span className="managed-monthly">then $10/mo</span>
              </div>
            </div>
            <p className="managed-plan-description">A clean, professional portfolio built specifically for students. Modern single-page site that shows off your projects, skills, and experience. Fast turnaround, mobile-friendly, and designed to help you stand out for internships, jobs, or grad school.</p>
            <button
              onClick={() => handleCheckout('studentPortfolio')}
              disabled={checkoutLoading === 'studentPortfolio'}
              className="btn btn-outline managed-plan-button"
            >
              {checkoutLoading === 'studentPortfolio' ? 'Processing...' : 'Get Your Portfolio'}
            </button>
          </div>

        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="founder" id="founder" aria-labelledby="founder-heading">
        <div className="container">
          <div className="founder-content" itemScope itemType="https://schema.org/Person">
            <div className="founder-left">
              <h2 id="founder-heading" className="section-title founder-section-title">Meet the Founder</h2>
              
              <div className="founder-image">
                <img
                  src="/founder.jpeg"
                  alt="Zain Khatri - NASA Engineer and Professional Web Developer"
                  itemProp="image"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <h3 className="founder-name" itemProp="name">Zain Khatri</h3>

              <div className="founder-logos">
                <img
                  src="/nasa.png"
                  alt="NASA - National Aeronautics and Space Administration"
                  className="company-logo"
                  loading="lazy"
                  decoding="async"
                />
                <img
                  src="/logo-ucberkeley.png"
                  alt="UC Berkeley - University of California Berkeley"
                  className="company-logo"
                  loading="lazy"
                  decoding="async"
                />
                <img
                  src="/ucsd.png"
                  alt="UC San Diego - University of California San Diego"
                  className="company-logo"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <div className="founder-right">
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
                className="btn btn-founder-portfolio"
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
        <div className="container">
          <h2 id="portfolio-heading" className="section-title">Web Development Portfolio</h2>
          <p className="section-subtitle">
            Explore live examples of professional websites including e-commerce, portfolios, and business sites. Real projects for real clients.
          </p>

          <div className="portfolio-grid">
            {portfolioItems.map((item, index) => (
              <div key={index} className="portfolio-card">
                <div className="portfolio-card-header">
                  <div className="portfolio-card-info">
                    <span className="portfolio-category">{item.category}</span>
                    <h3 className="portfolio-name">{item.name}</h3>
                    <span className={`portfolio-tier-badge tier-${item.tier.toLowerCase()}`}>
                      {item.tier} Tier
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline portfolio-link"
                    onClick={(e) => handleLinkClick(e, item.url)}
                  >
                    Visit Site →
                  </a>
                </div>
                <div className="portfolio-preview">
                  <iframe
                    src={item.url}
                    title={item.name}
                    className="portfolio-iframe-card"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    loading="lazy"
                    importance="low"
                  />
                </div>
              </div>
            ))}
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
              <TestimonialMarquee reviews={reviews} />
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact" aria-labelledby="contact-heading">
        <div className="container">
          <h2 id="contact-heading" className="section-title">Let's Work Together</h2>
          <p className="contact-text">
            Ready to start your project? Send us an email and we'll get back to you within 24 hours to discuss your website needs, pricing, and timeline.
          </p>
          <a
            href="mailto:ibtakarlabs@gmail.com?subject=Website Development Inquiry"
            className="btn btn-primary btn-large"
          >
            Email Us: ibtakarlabs@gmail.com
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
            <a href="mailto:ibtakarlabs@gmail.com">ibtakarlabs@gmail.com</a>
          </p>
          <p style={{ marginTop: '10px' }}>
            <a href="https://www.linkedin.com/company/ibtakar-labs/about/" target="_blank" rel="noopener noreferrer" onClick={(e) => handleLinkClick(e, 'https://www.linkedin.com/company/ibtakar-labs/about/')}>LinkedIn</a>
            {' • '}
            <a href="https://www.instagram.com/ibtakarlabs/" target="_blank" rel="noopener noreferrer" onClick={(e) => handleLinkClick(e, 'https://www.instagram.com/ibtakarlabs/')}>Instagram</a>
            {' • '}
            <a href="https://github.com/ibtakarlabs" target="_blank" rel="noopener noreferrer" onClick={(e) => handleLinkClick(e, 'https://github.com/ibtakarlabs')}>GitHub</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
