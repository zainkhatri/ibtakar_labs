import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import './TestimonialMarquee.css';

// Memoize individual review card
const ReviewCard = memo(({ review, index, renderStars }) => (
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
));

export function TestimonialMarquee({ reviews }) {
  // Memoize duplicated reviews
  const duplicatedReviews = useMemo(() => [...reviews, ...reviews, ...reviews], [reviews]);

  // Memoize renderStars function
  const renderStars = useCallback((rating) => {
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
  }, []);

  return (
    <div className="testimonial-marquee-wrapper">
      <div className="marquee-container">
        <div className="marquee-track">
          {duplicatedReviews.map((review, index) => (
            <ReviewCard
              key={`${review.id}-${index}`}
              review={review}
              index={index}
              renderStars={renderStars}
            />
          ))}
        </div>
      </div>
      <div className="marquee-gradient-left"></div>
      <div className="marquee-gradient-right"></div>
    </div>
  );
}

