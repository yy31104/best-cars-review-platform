import React, { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const Dealer = () => {
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [dealerLoading, setDealerLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [dealerError, setDealerError] = useState("");
  const [reviewsError, setReviewsError] = useState("");

  let params = useParams();
  let id =params.id;
  let post_review = window.location.origin+`/postreview/${id}`;

  const normalizeSentiment = (sentiment) => {
    const normalized = String(sentiment || "neutral").toLowerCase();
    if (normalized === "positive" || normalized === "negative") {
      return normalized;
    }
    return "neutral";
  }

  const sentimentLabel = (sentiment) => {
    const normalized = normalizeSentiment(sentiment);
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  useEffect(() => {
    const get_dealer = async ()=>{
      setDealerLoading(true);
      setDealerError("");
      try {
        const res = await fetch(window.location.origin+`/djangoapp/dealer/${id}`, {
          method: "GET"
        });
        const retobj = await res.json();

        if(retobj.status === 200) {
          let dealerobjs = Array.from(retobj.dealer)
          if(dealerobjs.length > 0) {
            setDealer(dealerobjs[0])
          } else {
            setDealer({})
            setDealerError("Dealer details could not be found.")
          }
        } else {
          setDealer({})
          setDealerError("Dealer details could not be loaded.")
        }
      } catch {
        setDealer({})
        setDealerError("Dealer details could not be loaded. Please try again.")
      }
      setDealerLoading(false);
    }

    const get_reviews = async ()=>{
      setReviewsLoading(true);
      setReviewsError("");
      try {
        const res = await fetch(window.location.origin+`/djangoapp/reviews/dealer/${id}`, {
          method: "GET"
        });
        const retobj = await res.json();

        if(retobj.status === 200) {
          setReviews(Array.from(retobj.reviews))
        } else {
          setReviews([])
        }
      } catch {
        setReviews([])
        setReviewsError("Reviews could not be loaded. Please try again.")
      }
      setReviewsLoading(false);
    }

    get_dealer();
    get_reviews();
  },[id]);

  let isLoggedIn = sessionStorage.getItem("username") != null ? true : false;

  const sentimentCounts = reviews.reduce((counts, review) => {
    const sentiment = normalizeSentiment(review.sentiment);
    counts[sentiment] += 1;
    return counts;
  }, {
    positive: 0,
    neutral: 0,
    negative: 0
  });

  return(
    <div className="bc-page">
      <Header/>
      <main className="bc-container bc-main dealer_detail_page">
        {dealerLoading ? (
          <div className="bc-card dealer_state">Loading dealer...</div>
        ) : dealerError ? (
          <div className="bc-card dealer_state">{dealerError}</div>
        ) : (
          <section className="bc-card dealer_detail_header">
            <div>
              <p className="bc-kicker">Dealer profile</p>
              <h1>{dealer.full_name}</h1>
              <div className="dealer_meta">
                <span>{dealer['city']}, {dealer['state']}</span>
                <span>{dealer['address']}</span>
                <span>ZIP {dealer['zip']}</span>
              </div>
              {isLoggedIn ? (
                <a className="bc-btn bc-btn-primary dealer_review_cta" href={post_review}>Write Review</a>
              ):<></>}
            </div>

            <div className="review_stats" aria-label="Review sentiment stats">
              <div className="stat_card">
                <span>{reviews.length}</span>
                <small>Total reviews</small>
              </div>
              <div className="stat_card stat_positive">
                <span>{sentimentCounts.positive}</span>
                <small>Positive</small>
              </div>
              <div className="stat_card stat_neutral">
                <span>{sentimentCounts.neutral}</span>
                <small>Neutral</small>
              </div>
              <div className="stat_card stat_negative">
                <span>{sentimentCounts.negative}</span>
                <small>Negative</small>
              </div>
            </div>
          </section>
        )}

        <section className="reviews_section" aria-labelledby="dealer-reviews">
          <div className="reviews_heading">
            <div>
              <p className="bc-kicker">Customer feedback</p>
              <h2 id="dealer-reviews">Reviews</h2>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="bc-card dealer_state">Loading reviews...</div>
          ): reviewsError ? (
            <div className="bc-card dealer_state">{reviewsError}</div>
          ) : reviews.length === 0 ? (
            <div className="bc-card dealer_state">
              <h3>No reviews yet</h3>
              <p className="bc-muted">This dealership does not have customer reviews yet.</p>
            </div>
          ) : (
            <div className="reviews_panel">
              {reviews.map((review, index) => (
                <article className='bc-card review_panel review_card' key={review.id || `${review.name}-${index}`}>
                  <div className="review_card_top">
                    <span className={`sentiment_chip sentiment_${normalizeSentiment(review.sentiment)}`}>
                      {sentimentLabel(review.sentiment)}
                    </span>
                    <span className="review_vehicle">{review.car_make} {review.car_model} {review.car_year}</span>
                  </div>
                  <p className='review'>{review.review}</p>
                  <p className="reviewer">Reviewed by {review.name}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Dealer
