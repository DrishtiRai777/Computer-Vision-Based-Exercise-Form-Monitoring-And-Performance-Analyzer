import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, [location]);

  const handleReportClick = () => {
    if (isLoggedIn) {
      navigate("/report");
    } else {
      alert("Please login first!");
      navigate("/login");
    }
  };

  const handleLogout = () => {
    if(window.confirm("Do you want to logout?")) {
      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
      navigate("/");
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/posture.png" alt="Logo" className="nav-logo-img" />
        <h2>Exercise Posture Analysis</h2>
      </div>

      <div className="nav-buttons">
        <Link to="/exercises">
          <button className="btn outline">Explore Exercises</button>
        </Link>

        <button className="btn outline" onClick={handleReportClick}>
          Posture Report
        </button>

        {isLoggedIn ? (
          <div className="user-profile-circle" onClick={handleLogout} title="Logout">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        ) : (
          <Link to="/auth">
            <button className="btn solid">Sign In/Up</button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;