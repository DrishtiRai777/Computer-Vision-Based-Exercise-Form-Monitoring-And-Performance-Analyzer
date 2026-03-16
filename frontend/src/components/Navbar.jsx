import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/posture.png" alt="Logo" className="nav-logo-img" />
        <h2>Exercise Posture Analysis</h2>
      </div>

      <div className="nav-buttons">
        <Link to="/exercises">
            <button className="btn outline">
                Explore Exercises
            </button>
        </Link>
        <Link to="/auth">
  <button className="btn solid">Sign In/Up</button>
</Link>
      </div>
    </nav>
  );
}

export default Navbar;