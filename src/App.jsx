import { useState, useEffect } from 'react'
import { database } from './firebase'
import { ref, push, onValue, query, orderByChild } from 'firebase/database'
import './App.css'

function App() {
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
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo(0, 0);

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
      category: "Web App"
    },
    {
      name: "Restaurant Website",
      url: "https://bholatskitchen.com",
      description: "Full-featured restaurant website with ordering",
      category: "E-commerce"
    },
    {
      name: "Organization Site",
      url: "https://mtcucsd.org",
      description: "Professional organization platform",
      category: "Organization"
    },
    {
      name: "Professional Portfolio",
      url: "https://tsharifi.com",
      description: "Elegant professional portfolio",
      category: "Portfolio"
    },
    {
      name: "Portfolio Site",
      url: "https://zainkhatri.com",
      description: "Personal portfolio showcasing web development mastery",
      category: "Portfolio"
    }
  ];

  const services = [
    {
      name: "Starter Website",
      price: "$1,200",
      delivery: "1 week",
      features: [
        "3 simple pages",
        "Basic template design",
        "Mobile responsive",
        "Contact form",
        "1 revision round"
      ]
    },
    {
      name: "Pro Website",
      price: "$2,400",
      delivery: "2 weeks",
      features: [
        "Custom visual design & branding",
        "Up to 5 dynamic pages",
        "Advanced React animations",
        "E-commerce/booking system",
        "Content management dashboard",
        "Advanced SEO & analytics",
        "Performance optimization",
        "2 revision rounds"
      ],
      popular: true
    },
    {
      name: "Premium Website",
      price: "$4,000+",
      delivery: "3-4 weeks",
      features: [
        "Everything in Pro +",
        "Custom database & API",
        "Email automation & marketing",
        "Social media integration",
        "Payment gateway integration",
        "Multi-language support",
        "Unlimited revisions"
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
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Consultation
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Professional Website Development</h1>
          <p className="hero-subtitle">
            Beautiful websites that get you more customers and grow your business
          </p>
          <div className="hero-cta">
            <a
              href="https://calendly.com/zainnkhatri/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Schedule Consultation
            </a>
            <a href="#portfolio" className="btn btn-secondary">
              View Portfolio
            </a>
          </div>
        </div>
      </section>


      {/* Services Section */}
      <section className="services" id="services">
        <div className="container">
          <h2 className="section-title">Services & Pricing</h2>
          <p className="section-subtitle">
            Professional packages designed to meet your needs. All packages include responsive design and require a Managed Web Plan ($50/month) for hosting and support.
          </p>

          <div className="services-grid">
            {services.map((service, index) => (
              <div
                key={index}
                className={`service-card ${service.popular ? 'popular' : ''}`}
              >
                {service.popular && <div className="popular-badge">Most Popular</div>}
                <h3 className="service-name">{service.name}</h3>
                <div className="service-price">{service.price}</div>
                <div className="service-delivery">Delivery: {service.delivery}</div>
                <ul className="service-features">
                  {service.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
                <a
                  href="https://calendly.com/zainnkhatri/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>

          <div className="managed-plan">
            <h3>Managed Web Plan (Required)</h3>
            <p className="managed-price">$50/month</p>
            <p>Includes managed hosting, SSL certificates, domain renewal, security updates, up to 30 minutes of content updates monthly, and email support within 2 business days.</p>
          </div>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="founder" id="founder">
        <div className="container">
          <h2 className="section-title">Meet the Founder</h2>
          <p className="section-subtitle">
            Building digital experiences with passion and expertise
          </p>

          <div className="founder-content">
            <div className="founder-image">
              <img src="/grad.JPG" alt="Zain Khatri" />
            </div>
            <div className="founder-info">
              <h3 className="founder-name">Zain Khatri</h3>
              <p className="founder-title">NASA Engineer</p>

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
                <img src="/nasa.png" alt="NASA" className="company-logo" />
                <img src="/logo-ucberkeley.png" alt="UC Berkeley" className="company-logo" />
                <img src="/ucsd.png" alt="UC San Diego" className="company-logo" />
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
              >
                View Full Portfolio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="portfolio" id="portfolio">
        <div className="container portfolio-container">
          <h2 className="section-title">Portfolio</h2>
          <p className="section-subtitle">
            Explore live examples of my recent work across various industries
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
                  <p className="viewer-description">{portfolioItems[activeProject].description}</p>
                  <a
                    href={portfolioItems[activeProject].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="viewer-link"
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
      <section className="testimonials" id="testimonials">
        <div className="container">
          <h2 className="section-title">What Clients Say</h2>
          <p className="section-subtitle">
            Don't just take my word for it - hear from satisfied clients
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
              <div className="testimonials-grid">
                {reviews.map((review) => (
                  <div key={review.id} className="testimonial-card">
                    <div className="testimonial-quote">"</div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                    <p className="testimonial-text">{review.text}</p>
                    <div className="testimonial-author">
                      <div className="author-info">
                        <div className="author-name">{review.name}</div>
                        <div className="author-role">{review.role}</div>
                        <div className="author-company">{review.company}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="container">
          <h2 className="section-title">Let's Work Together</h2>
          <p className="contact-text">
            Schedule a free consultation to discuss your project
          </p>
          <a
            href="https://calendly.com/zainnkhatri/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-large"
          >
            Schedule Free Consultation
          </a>
          <div className="contact-info">
            <p>Visit <a href="https://zainkhatri.com" target="_blank" rel="noopener noreferrer">zainkhatri.com</a></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Ibtakar Labs. Professional Website Development Services.</p>
          <p>
            <a href="https://zainkhatri.com" target="_blank" rel="noopener noreferrer">zainkhatri.com</a>
            {' • '}
            <a href="https://calendly.com/zainnkhatri/30min" target="_blank" rel="noopener noreferrer">Schedule Meeting</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
