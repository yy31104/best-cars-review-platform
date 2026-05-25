import React, { useState } from 'react';

import "./Register.css";
import Header from '../Header/Header';

const Register = () => {
  const [userName, setUserName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register_url = window.location.origin + "/djangoapp/register";

  const register = async (e) => {
    e.preventDefault();

    const res = await fetch(register_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "userName": userName,
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "password": password,
      }),
    });

    const json = await res.json();
    if (json.status != null && json.status === "Authenticated") {
      sessionStorage.setItem('username', json.userName);
      window.location.href = "/";
    } else {
      alert(json.message || "The user could not be registered.");
    }
  };

  return (
    <div>
      <Header/>
      <div className="register_page">
      <form className="card register_container" onSubmit={register}>
        <h1 className="register_header">Register</h1>
        <div className="inputs">
          <div className="mb-3 w-100">
            <label className="form-label" htmlFor="register_username">Username</label>
            <input type="text" id="register_username" name="username" placeholder="Username" className="form-control" value={userName} onChange={(e) => setUserName(e.target.value)} required/>
          </div>
          <div className="mb-3 w-100">
            <label className="form-label" htmlFor="register_first_name">First Name</label>
            <input type="text" id="register_first_name" name="firstName" placeholder="First Name" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
          </div>
          <div className="mb-3 w-100">
            <label className="form-label" htmlFor="register_last_name">Last Name</label>
            <input type="text" id="register_last_name" name="lastName" placeholder="Last Name" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
          </div>
          <div className="mb-3 w-100">
            <label className="form-label" htmlFor="register_email">Email</label>
            <input type="email" id="register_email" name="email" placeholder="Email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required/>
          </div>
          <div className="mb-3 w-100">
            <label className="form-label" htmlFor="register_password">Password</label>
            <input type="password" id="register_password" name="password" placeholder="Password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required/>
          </div>
        </div>
        <div className="submit_panel">
          <input className="btn btn-primary submit" type="submit" value="Register"/>
        </div>
      </form>
      </div>
    </div>
  );
};

export default Register;
