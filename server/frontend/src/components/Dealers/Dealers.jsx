import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const dealer_url = "/djangoapp/get_dealers";
  const dealer_url_by_state = "/djangoapp/get_dealers/";

  const isLoggedIn = sessionStorage.getItem("username") != null;

  const filterDealers = async (state) => {
    setLoading(true);
    setErrorMessage("");
    setSelectedState(state);

    try {
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
        setErrorMessage("Dealers could not be loaded for this state.")
      }
    } catch {
      setDealersList([])
      setErrorMessage("Dealers could not be loaded. Please try again.")
    }

    setLoading(false);
  }

  const get_dealers = async ()=>{
    setLoading(true);
    setErrorMessage("");

    try {
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

        setStates(Array.from(new Set(states)).sort())
        setDealersList(all_dealers)
      } else {
        setStates([])
        setDealersList([])
        setErrorMessage("Dealers could not be loaded.")
      }
    } catch {
      setStates([])
      setDealersList([])
      setErrorMessage("Dealers could not be loaded. Please try again.")
    }

    setLoading(false);
  }

  useEffect(() => {
    get_dealers();
  },[]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleDealers = dealersList.filter((dealer) => {
    if (!normalizedSearch) {
      return true;
    }

    return [
      dealer['full_name'],
      dealer['city'],
      dealer['state']
    ].some((value) => String(value || "").toLowerCase().includes(normalizedSearch));
  });

  return(
    <div className="bc-page">
      <Header/>

      <main className="bc-container bc-main dealers_page">
        <section className="directory_header bc-card">
          <div>
            <p className="bc-kicker">Dealerships</p>
            <h1>Dealership Directory</h1>
            <p className="bc-muted directory_subtitle">
              Browse trusted dealership listings, compare locations, and open a dealer profile to read customer reviews.
            </p>
          </div>
          <div className="dealer_count" aria-label={`${visibleDealers.length} dealers visible`}>
            <span>{visibleDealers.length}</span>
            <small>{visibleDealers.length === 1 ? "dealer shown" : "dealers shown"}</small>
          </div>
        </section>

        <section className="filter_bar bc-card" aria-label="Dealer filters">
          <div className="filter_group">
            <label htmlFor="dealer_search" className="form-label">Search dealers</label>
            <input
              id="dealer_search"
              className="form-control"
              type="search"
              value={searchTerm}
              placeholder="Name, city, or state"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter_group">
            <label htmlFor="state" className="form-label">State</label>
            <select className="form-select" name="state" id="state" value={selectedState} onChange={(e) => filterDealers(e.target.value)}>
              <option value="All">All States</option>
              {states.map(state => (
                  <option value={state} key={state}>{state}</option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="bc-card directory_state">Loading dealers...</div>
        ) : errorMessage ? (
          <div className="bc-card directory_state">{errorMessage}</div>
        ) : visibleDealers.length === 0 ? (
          <div className="bc-card directory_state">
            <h2>No dealers found</h2>
            <p className="bc-muted">Try clearing the search field or choosing a different state.</p>
          </div>
        ) : (
          <section className="dealers_grid" aria-label="Dealer results">
            {visibleDealers.map(dealer => (
              <article className="bc-card dealer_card" key={dealer['id']}>
                <div className="dealer_card_header">
                  <span className="dealer_id">#{dealer['id']}</span>
                  <span className="state_chip">{dealer['state']}</span>
                </div>
                <h2><a href={'/dealer/'+dealer['id']}>{dealer['full_name']}</a></h2>
                <p className="dealer_location">{dealer['city']}, {dealer['state']}</p>
                <p className="bc-muted dealer_address">{dealer['address']}</p>
                <p className="bc-muted dealer_zip">ZIP {dealer['zip']}</p>
                <div className="dealer_card_actions">
                  <a className="bc-btn bc-btn-secondary" href={'/dealer/'+dealer['id']}>View Details</a>
                  {isLoggedIn ? (
                    <a className="bc-btn bc-btn-primary" href={`/postreview/${dealer['id']}`}>Write Review</a>
                  ):<></>}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default Dealers
