import React, { useState } from 'react';

import "./Login.css";
import Header from '../Header/Header';

const Login = ({ onClose }) => {

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [open,setOpen] = useState(true)

  let login_url = window.location.origin+"/djangoapp/login";

  const login = async (e) => {
    e.preventDefault();

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
      alert("The user could not be authenticated.")
    }
};

  if (!open) {
    window.location.href = "/";
  };
  

  return (
    <div>
      <Header/>
    <div className="auth_page" onClick={onClose}>
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className='card auth_card'
      >
          <form className="login_panel" onSubmit={login}>
              <h1 className="auth_title">Login</h1>
              <div className="mb-3 w-100">
              <label className="form-label" htmlFor="username">Username</label>
              <input type="text" id="username" name="username" placeholder="Username" className="form-control" onChange={(e) => setUserName(e.target.value)}/>
              </div>
              <div className="mb-3 w-100">
              <label className="form-label" htmlFor="psw">Password</label>
              <input id="psw" name="psw" type="password"  placeholder="Password" className="form-control" onChange={(e) => setPassword(e.target.value)}/>
              </div>
              <div className="auth_actions">
              <input className="btn btn-primary action_button" type="submit" value="Login"/>
              <input className="btn btn-outline-secondary action_button" type="button" value="Cancel" onClick={()=>setOpen(false)}/>
              </div>
              <a className="loginlink" href="/register">Register Now</a>
          </form>
      </div>
    </div>
    </div>
  );
};

export default Login;
