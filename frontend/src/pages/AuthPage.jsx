import React, { useState } from "react";
import "./AuthPage.css";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "../utils/auth";


function AuthPage() {
  const [formData, setFormData] = useState({
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: ""
});

  const [error, setError] = useState("");
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const { username, email, phone, password, confirmPassword } = formData;

    if (!username || !email || !phone || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Phone number must be 10 digits");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    alert("Signup successful!");
  };

  const handleGoogleSuccess = async (credentialResponse) => {
  try {
    await loginWithGoogle(credentialResponse.credential);

    alert("Google signup successful!");
    navigate("/");

  } catch (err) {
    console.error(err);
    alert("Google signup failed");
  }
 };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* LEFT IMAGE AREA */}
        <div className="auth-left">
          <img
            src="/posture.png"
            alt="exercise"
            className="auth-image"
          />

        </div>
        {/* RIGHT FORM AREA */}

        <div className="auth-right">

          <h1 className="auth-title">WELCOME</h1>

          <p className="auth-subtitle">
            Sign Up to continue to Exercise posture analysis
          </p>

          <p className="login-text">
            Already have an account? 
            <Link to="/login"><span>Login</span></Link>
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />

            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="tel"
              placeholder="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <input
              type="password"
              placeholder="Create Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {error && <p className="error-text">{error}</p>}
            <button className="signup-btn">
              Sign Up
            </button>

          </form>

          <div className="divider">OR</div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Google Login Failed")}
            />
          </div>

          <p className="terms">
            By signing up you agree to the ToS and Privacy Policy
          </p>

        </div>

      </div>
    </div>
  );
}

export default AuthPage;