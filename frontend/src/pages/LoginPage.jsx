import React, { useState } from "react";
import "./AuthPage.css";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    // ✅ Fake login success
    localStorage.setItem("isLoggedIn", "true");

    alert("Login successful!");
    navigate("/"); // go to home
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="auth-left">
          <img src="/posture.png" alt="exercise" className="auth-image"/>
        </div>

        <div className="auth-right">

          <h1 className="auth-title">WELCOME BACK</h1>

          <p className="auth-subtitle">
            Login to continue to Exercise posture analysis
          </p>

          <form className="auth-form" onSubmit={handleLogin}>

            <input 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="signup-btn">
              Login
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}

export default LoginPage;