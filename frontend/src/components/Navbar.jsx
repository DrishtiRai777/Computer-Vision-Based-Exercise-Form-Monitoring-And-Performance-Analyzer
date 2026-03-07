import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <span>🏃</span>
        <h2>Exercise Posture Analysis</h2>
      </div>

      <div className="nav-buttons">
        <Link to="/exercises">
            <button className="btn outline">
                Explore Exercises
            </button>
        </Link>
        <button className="btn solid">Sign In/Up</button>
      </div>
    </nav>
  );
}

export default Navbar;