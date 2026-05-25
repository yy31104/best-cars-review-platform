import React, { useState } from 'react';

import "./Login.css";
import Header from '../Header/Header';

const Login = ({ onClose }) => {

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [open,setOpen] = useState(true)
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  let login_url = window.location.origin+"/djangoapp/login";

  const login = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const res = await fetch(login_url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              "userName": userName,
              "password": password
          }),
      });

      const json = await res.json();
      if (json.status != null && json.status === "Authenticated") {
          sessionStorage.setItem('username', json.userName);
          setOpen(false);
      }
      else {
        setErrorMessage("The user could not be authenticated.")
      }
    } catch {
      setErrorMessage("The user could not be authenticated. Please try again.")
    }

    setSubmitting(false);
};

  if (!open) {
    window.location.href = "/";
  };

  return (
    <div className="bc-page">
      <Header/>
      <div className="auth_page" onClick={onClose}>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className='bc-card auth_card'
        >
          <form className="login_panel" onSubmit={login}>
            <p className="bc-kicker">Welcome back</p>
            <h1 className="auth_title">Login</h1>
            <p className="bc-muted auth_intro">Sign in to write dealership reviews and manage your Best Cars experience.</p>
            {errorMessage ? <div className="auth_error" role="alert">{errorMessage}</div> : <></>}
            <div className="mb-3 w-100">
              <label className="form-label" htmlFor="username">Username</label>
              <input type="text" id="username" name="username" placeholder="Username" className="form-control" value={userName} onChange={(e) => setUserName(e.target.value)}/>
            </div>
            <div className="mb-3 w-100">
              <label className="form-label" htmlFor="psw">Password</label>
              <input id="psw" name="psw" type="password" placeholder="Password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <div className="auth_actions">
              <button className="bc-btn bc-btn-primary action_button" type="submit" disabled={submitting}>{submitting ? "Logging in..." : "Login"}</button>
              <button className="bc-btn bc-btn-secondary action_button" type="button" onClick={()=>setOpen(false)}>Cancel</button>
            </div>
            <a className="auth_link" href="/register">Register Now</a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
