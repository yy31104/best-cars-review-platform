import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png"

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  const dealer_url = "/djangoapp/get_dealers";
  const dealer_url_by_state = "/djangoapp/get_dealers/";

  const filterDealers = async (state) => {
    setLoading(true);
    const url = state === "All" ? dealer_url : dealer_url_by_state + encodeURIComponent(state);
    const res = await fetch(url, {
      method: "GET"
    });
    const retobj = await res.json();
    if(retobj.status === 200) {
      let state_dealers = Array.from(retobj.dealers)
      setDealersList(state_dealers)
    } else {
      setDealersList([])
    }
    setLoading(false);
  }

  const get_dealers = async ()=>{
    setLoading(true);
    const res = await fetch(dealer_url, {
      method: "GET"
    });
    const retobj = await res.json();
    if(retobj.status === 200) {
      let all_dealers = Array.from(retobj.dealers)
      let states = [];
      all_dealers.forEach((dealer)=>{
        states.push(dealer.state)
      });

      setStates(Array.from(new Set(states)))
      setDealersList(all_dealers)
    } else {
      setStates([])
      setDealersList([])
    }
    setLoading(false);
  }
  useEffect(() => {
    get_dealers();
  },[]);


let isLoggedIn = sessionStorage.getItem("username") != null ? true : false;
return(
  <div>
      <Header/>

     <div className="container mt-4">
      <table className='table table-striped table-hover table-bordered align-middle dealers_table'>
        <thead className="table-info">
          <tr>
            <th>ID</th>
            <th>Dealer Name</th>
            <th>City</th>
            <th>Address</th>
            <th>Zip</th>
            <th>
            <select className="form-select" name="state" id="state" defaultValue="" onChange={(e) => filterDealers(e.target.value)}>
            <option value="" disabled hidden>State</option>
            <option value="All">All States</option>
            {states.map(state => (
                <option value={state} key={state}>{state}</option>
            ))}
            </select>

            </th>
            {isLoggedIn ? (
                <th>Review Dealer</th>
               ):<></>
            }
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={isLoggedIn ? 7 : 6}>Loading dealers...</td>
            </tr>
          ) : dealersList.length === 0 ? (
            <tr>
              <td colSpan={isLoggedIn ? 7 : 6}>No dealers found.</td>
            </tr>
          ) : dealersList.map(dealer => (
            <tr key={dealer['id']}>
              <td>{dealer['id']}</td>
              <td><a href={'/dealer/'+dealer['id']}>{dealer['full_name']}</a></td>
              <td>{dealer['city']}</td>
              <td>{dealer['address']}</td>
              <td>{dealer['zip']}</td>
              <td>{dealer['state']}</td>
              {isLoggedIn ? (
                <td><a href={`/postreview/${dealer['id']}`}><img src={review_icon} className="review_icon" alt="Post Review"/></a></td>
               ):<></>
              }
            </tr>
          ))}
        </tbody>
      </table>
     </div>
  </div>
)
}

export default Dealers
