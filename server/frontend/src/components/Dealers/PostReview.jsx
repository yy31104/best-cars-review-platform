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

  let params = useParams();
  let id =params.id;
  let review_url = window.location.origin+`/djangoapp/add_review`;

  const postreview = async ()=>{
    if(!sessionStorage.getItem("username")) {
      alert("Please log in to post a review.")
      window.location.href = "/login";
      return;
    }

    let name = sessionStorage.getItem("firstname")+" "+sessionStorage.getItem("lastname");
    //If the first and second name are stores as null, use the username
    if(name.includes("null")) {
      name = sessionStorage.getItem("username");
    }
    if(!model || review === "" || date === "" || year === "" || model === "") {
      alert("All details are mandatory")
      return;
    }

    let model_split = model.split(" ");
    let make_chosen = model_split[0];
    let model_chosen = model_split[1];

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
      alert(json.message || "The review could not be posted.")
  }

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

    Promise.all([get_dealer(), get_cars()]).finally(() => setLoading(false));
  },[id]);


  return (
    <div>
      <Header/>
      <div className="container mt-4 postreview_container">
      {loading ? (
        <div>Loading review form...</div>
      ) : (
      <>
      <h1 style={{color:"darkblue"}}>{dealer.full_name}</h1>
      <div className="mb-3">
        <label htmlFor="review" className="form-label">Review</label>
        <textarea id='review' className="form-control" rows='7' onChange={(e) => setReview(e.target.value)}></textarea>
      </div>
      <div className='mb-3'>
        <label htmlFor="purchase_date" className="form-label">Purchase Date</label>
        <input id="purchase_date" className="form-control" type="date" onChange={(e) => setDate(e.target.value)}/>
      </div>
      <div className='mb-3'>
        <label htmlFor="cars" className="form-label">Car Make and Model</label>
        <select className="form-select" name="cars" id="cars" defaultValue="" onChange={(e) => setModel(e.target.value)}>
        <option value="" disabled hidden>Choose Car Make and Model</option>
        {carmodels.map(carmodel => (
            <option value={carmodel.CarMake+" "+carmodel.CarModel} key={carmodel.id}>{carmodel.CarMake} {carmodel.CarModel}</option>
        ))}
        </select>
      </div >

      <div className='mb-3'>
        <label htmlFor="car_year" className="form-label">Car Year</label>
        <input id="car_year" className="form-control" type="number" onChange={(e) => setYear(e.target.value)} max={2023} min={2015}/>
      </div>

      <div>
      <button className='btn btn-primary postreview' onClick={postreview}>Post Review</button>
      </div>
      </>
      )}
    </div>
    </div>
  )
}
export default PostReview
