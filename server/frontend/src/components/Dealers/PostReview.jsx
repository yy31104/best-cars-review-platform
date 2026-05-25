import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");

  let params = useParams();
  let id =params.id;
  let review_url = window.location.origin+`/djangoapp/add_review`;

  const validateReview = () => {
    const nextErrors = {};

    if(!model) {
      nextErrors.model = "Choose the vehicle make and model.";
    }

    if(review.trim() === "") {
      nextErrors.review = "Write a short review of your dealership experience.";
    }

    if(date === "") {
      nextErrors.date = "Enter the purchase date.";
    }

    if(year === "") {
      nextErrors.year = "Enter the vehicle year.";
    } else if(Number(year) < 2015 || Number(year) > 2023) {
      nextErrors.year = "Enter a year between 2015 and 2023.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const postreview = async (e)=>{
    e.preventDefault();
    setFormMessage("");

    if(!sessionStorage.getItem("username")) {
      setFormMessage("Please log in to post a review.")
      window.location.href = "/login";
      return;
    }

    if(!validateReview()) {
      setFormMessage("Please complete the highlighted fields.")
      return;
    }

    let name = sessionStorage.getItem("firstname")+" "+sessionStorage.getItem("lastname");
    //If the first and second name are stores as null, use the username
    if(name.includes("null")) {
      name = sessionStorage.getItem("username");
    }

    let model_split = model.split(" ");
    let make_chosen = model_split[0];
    let model_chosen = model_split.slice(1).join(" ");

    let jsoninput = JSON.stringify({
      "name": name,
      "dealership": id,
      "review": review,
      "purchase": true,
      "purchase_date": date,
      "car_make": make_chosen,
      "car_model": model_chosen,
      "car_year": year,
    });

    setSubmitting(true);

    try {
      const res = await fetch(review_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsoninput,
      });

      const json = await res.json();
      if (json.status === 200) {
          window.location.href = window.location.origin+"/dealer/"+id;
      } else {
          setFormMessage(json.message || "The review could not be posted.")
      }
    } catch {
      setFormMessage("The review could not be posted. Please try again.")
    }

    setSubmitting(false);
  }

  useEffect(() => {
    if(!sessionStorage.getItem("username")) {
      window.location.href = "/login";
      return;
    }

    const get_dealer = async ()=>{
      const res = await fetch(window.location.origin+`/djangoapp/dealer/${id}`, {
        method: "GET"
      });
      const retobj = await res.json();

      if(retobj.status === 200) {
        let dealerobjs = Array.from(retobj.dealer)
        if(dealerobjs.length > 0)
          setDealer(dealerobjs[0])
      }
    }

    const get_cars = async ()=>{
      const res = await fetch(window.location.origin+`/djangoapp/get_cars`, {
        method: "GET"
      });
      const retobj = await res.json();

      let carmodelsarr = Array.from(retobj.CarModels)
      setCarmodels(carmodelsarr)
    }

    Promise.all([get_dealer(), get_cars()])
      .catch(() => setFormMessage("Review form details could not be loaded. Please try again."))
      .finally(() => setLoading(false));
  },[id]);

  return (
    <div className="bc-page">
      <Header/>
      <main className="bc-container bc-main postreview_page">
        {loading ? (
          <div className="bc-card dealer_state">Loading review form...</div>
        ) : (
          <form className="bc-card postreview_container" onSubmit={postreview}>
            <div className="postreview_header">
              <p className="bc-kicker">Write a review</p>
              <h1>{dealer.full_name}</h1>
              <p className="bc-muted">Share a clear, useful account of your purchase experience.</p>
            </div>

            {formMessage ? (
              <div className="form_message" role="alert">{formMessage}</div>
            ) : <></>}

            <section className="form_section" aria-labelledby="dealer-info">
              <h2 id="dealer-info">Dealer info</h2>
              <div className="dealer_summary">
                <strong>{dealer.full_name}</strong>
                <span>{dealer['city']}, {dealer['state']}</span>
                <span>{dealer['address']}</span>
              </div>
            </section>

            <section className="form_section" aria-labelledby="vehicle-details">
              <h2 id="vehicle-details">Vehicle details</h2>
              <div className="form_grid">
                <div>
                  <label htmlFor="cars" className="form-label">Car Make and Model</label>
                  <select className={`form-select ${formErrors.model ? "is-invalid" : ""}`} name="cars" id="cars" value={model} onChange={(e) => setModel(e.target.value)}>
                    <option value="" disabled>Choose Car Make and Model</option>
                    {carmodels.map(carmodel => (
                        <option value={carmodel.CarMake+" "+carmodel.CarModel} key={carmodel.id}>{carmodel.CarMake} {carmodel.CarModel}</option>
                    ))}
                  </select>
                  {formErrors.model ? <div className="field_error">{formErrors.model}</div> : <></>}
                </div>

                <div>
                  <label htmlFor="car_year" className="form-label">Car Year</label>
                  <input id="car_year" className={`form-control ${formErrors.year ? "is-invalid" : ""}`} type="number" value={year} onChange={(e) => setYear(e.target.value)} max={2023} min={2015}/>
                  {formErrors.year ? <div className="field_error">{formErrors.year}</div> : <></>}
                </div>

                <div>
                  <label htmlFor="purchase_date" className="form-label">Purchase Date</label>
                  <input id="purchase_date" className={`form-control ${formErrors.date ? "is-invalid" : ""}`} type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
                  {formErrors.date ? <div className="field_error">{formErrors.date}</div> : <></>}
                </div>
              </div>
            </section>

            <section className="form_section" aria-labelledby="review-details">
              <h2 id="review-details">Review details</h2>
              <label htmlFor="review" className="form-label">Review</label>
              <textarea id='review' className={`form-control ${formErrors.review ? "is-invalid" : ""}`} rows='7' value={review} onChange={(e) => setReview(e.target.value)}></textarea>
              {formErrors.review ? <div className="field_error">{formErrors.review}</div> : <></>}
            </section>

            <div className="form_actions">
              <button className='bc-btn bc-btn-primary postreview' type="submit" disabled={submitting}>
                {submitting ? "Posting..." : "Post Review"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
export default PostReview
