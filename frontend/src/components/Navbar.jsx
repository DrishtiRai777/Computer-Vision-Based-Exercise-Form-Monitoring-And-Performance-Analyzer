import { Link ,useNavigate} from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  // ✅ Check login before going to report
  const handleReportClick = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn) {
      navigate("/report");
    } else {
      alert("Please login first!");
      navigate("/login");
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
            <button className="btn outline">
                Explore Exercises
            </button>
        </Link>

        <button className="btn outline" onClick={handleReportClick}>
          Posture Report
        </button>
        <Link to="/auth">
  <button className="btn solid">Sign In/Up</button>
</Link>
      </div>
    </nav>
  );
}

export default Navbar;