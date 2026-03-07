import React from "react";
import "./AuthPage.css";

function LoginPage() {
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

          <form className="auth-form">

            <input type="email" placeholder="Email" />

            <input type="password" placeholder="Password" />

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