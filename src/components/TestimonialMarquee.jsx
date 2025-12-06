import { useState, useEffect } from 'react';
import './TestimonialMarquee.css';

export function TestimonialMarquee({ reviews }) {
  // Duplicate reviews for seamless loop
  const duplicatedReviews = [...reviews, ...reviews, ...reviews];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="marquee-star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="marquee-star half">★</span>);
    }
    
    return stars;
  };

  return (
    <div className="testimonial-marquee-wrapper">
      <div className="marquee-container">
        <div className="marquee-track">
          {duplicatedReviews.map((review, index) => (
            <div key={`${review.id}-${index}`} className="marquee-card">
              <div className="marquee-quote">"</div>
              <div className="marquee-rating">
                {renderStars(review.rating)}
              </div>
              <p className="marquee-text">{review.text}</p>
              <div className="marquee-author">
                <div className="marquee-author-info">
                  <div className="marquee-author-name">{review.name}</div>
                  <div className="marquee-author-role">{review.role}</div>
                  <div className="marquee-author-company">{review.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="marquee-gradient-left"></div>
      <div className="marquee-gradient-right"></div>
    </div>
  );
}

