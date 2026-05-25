import React from 'react';
import "../assets/style.css";
import "../assets/bootstrap.min.css";

const Header = () => {
    const navLinkStyle = {
      borderRadius: "8px",
      color: "#172321",
      fontSize: "1rem",
      fontWeight: 700,
      padding: "8px 12px",
      textDecoration: "none"
    };

    const styles = {
      nav: {
        backgroundColor: "rgba(255, 255, 255, 0.94)",
        borderBottom: "1px solid #d9e3df",
        boxShadow: "0 8px 24px rgba(23, 35, 33, 0.08)",
        minHeight: "76px"
      },
      inner: {
        alignItems: "center",
        display: "flex",
        flexWrap: "wrap",
        gap: "24px",
        justifyContent: "space-between",
        paddingBottom: "14px",
        paddingTop: "14px"
      },
      brand: {
        alignItems: "center",
        color: "#172321",
        display: "inline-flex",
        flex: "0 0 auto",
        fontSize: "1.35rem",
        fontWeight: 800,
        gap: "10px",
        textDecoration: "none"
      },
      logo: {
        height: "42px",
        width: "42px"
      },
      navLinks: {
        alignItems: "center",
        display: "flex",
        flex: "1 1 auto",
        flexWrap: "wrap",
        gap: "8px"
      },
      sessionPanel: {
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        gap: "8px",
        justifyContent: "flex-end",
        padding: 0
      },
      username: {
        color: "#1f5d50",
        fontSize: "1rem",
        fontWeight: 800
      }
    };

    const logout = async (e) => {
    e.preventDefault();
    let logout_url = window.location.origin+"/djangoapp/logout";
    const res = await fetch(logout_url, {
      method: "GET",
    });
  
    const json = await res.json();
    if (json) {
      let username = sessionStorage.getItem('username');
      sessionStorage.removeItem('username');
      window.location.href = window.location.origin;
      window.location.reload();
      alert("Logging out "+username+"...")
    }
    else {
      alert("The user could not be logged out.")
    }
  };
    
//The default home page items are the login details panel
let home_page_items =  <div></div>

//Gets the username in the current session
let curr_user = sessionStorage.getItem('username')

//If the user is logged in, show the username and logout option on home page
if ( curr_user !== null &&  curr_user !== "") {
    home_page_items = <div className="input_panel" style={styles.sessionPanel}>
      <span className='username' style={styles.username}>{sessionStorage.getItem("username")}</span>
    <a className="nav_item" href="/djangoapp/logout" onClick={logout} style={navLinkStyle}>Logout</a>
  </div>
}
    return (
        <div>
          <nav className="navbar navbar-expand-lg navbar-light" style={styles.nav}>
            <div className="container-fluid" style={styles.inner}>
              <a href="/" style={styles.brand} aria-label="Best Cars home">
                <img src="/static/img/logo-mark.svg" alt="" style={styles.logo} />
                <span>Best Cars</span>
              </a>
              <div id="navbarText" style={styles.navLinks}>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0" style={styles.navLinks}>
                  <li className="nav-item">
                    <a className="nav-link active" style={navLinkStyle} aria-current="page" href="/">Home</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" style={navLinkStyle} href="/dealers">Dealers</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" style={navLinkStyle} href="/about">About Us</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" style={navLinkStyle} href="/contact">Contact Us</a>
                  </li>
                </ul>
                <span className="navbar-text">
                  <div className="loginlink" id="loginlogout">
                  {home_page_items}
                  </div>
                  </span>
              </div>
            </div>
          </nav>
        </div>
    )
}

export default Header
