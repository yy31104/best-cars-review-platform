import React, { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png"
import neutral_icon from "../assets/neutral.png"
import negative_icon from "../assets/negative.png"
import review_icon from "../assets/reviewbutton.png"
import Header from '../Header/Header';

const Dealer = () => {


  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [dealerLoading, setDealerLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  let params = useParams();
  let id =params.id;
  let post_review = window.location.origin+`/postreview/${id}`;

  const senti_icon = (sentiment)=>{
    let icon = sentiment === "positive"?positive_icon:sentiment==="negative"?negative_icon:neutral_icon;
    return icon;
  }

  useEffect(() => {
    const get_dealer = async ()=>{
      setDealerLoading(true);
      const res = await fetch(window.location.origin+`/djangoapp/dealer/${id}`, {
        method: "GET"
      });
      const retobj = await res.json();

      if(retobj.status === 200) {
        let dealerobjs = Array.from(retobj.dealer)
        if(dealerobjs.length > 0) {
          setDealer(dealerobjs[0])
        }
      }
      setDealerLoading(false);
    }

    const get_reviews = async ()=>{
      setReviewsLoading(true);
      const res = await fetch(window.location.origin+`/djangoapp/reviews/dealer/${id}`, {
        method: "GET"
      });
      const retobj = await res.json();

      if(retobj.status === 200) {
        setReviews(Array.from(retobj.reviews))
      } else {
        setReviews([])
      }
      setReviewsLoading(false);
    }

    get_dealer();
    get_reviews();
  },[id]);

let isLoggedIn = sessionStorage.getItem("username") != null ? true : false;

return(
  <div>
      <Header/>
      <div className="container mt-4">
        {dealerLoading ? (
          <div className="alert alert-info dealer_state">Loading dealer...</div>
        ) : (
          <div className="dealer_header">
            <h1 style={{color:"grey"}}>
              {dealer.full_name}
              {isLoggedIn ? (
                <a href={post_review}><img src={review_icon} style={{width:'54px',marginLeft:'10px',marginTop:'10px'}} alt='Post Review'/></a>
              ):<></>}
            </h1>
            <h4 style={{color:"grey"}}>{dealer['city']}, {dealer['address']}, Zip - {dealer['zip']}, {dealer['state']} </h4>
          </div>
        )}
        <div className="reviews_panel">
        {reviewsLoading ? (
          <div className="alert alert-info dealer_state">Loading reviews...</div>
        ): reviews.length === 0 ? <div className="alert alert-light border dealer_state">No reviews yet!</div> :
        reviews.map(review => (
          <div className='review_panel' key={review.id}>
            <img src={senti_icon(review.sentiment)} className="emotion_icon" alt='Sentiment'/>
            <div className='review'>{review.review}</div>
            <div className="reviewer">{review.name} {review.car_make} {review.car_model} {review.car_year}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
)
}

export default Dealer
