import { Link } from "react-router-dom";


function Hero() {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1 className="hero-title fade-in">
            Improve Your Posture with Exercise Analysis
        </h1>

        <p className="hero-text fade-in-delay">
            Track and analyze your posture in real time using OpenCV.
        </p>

        <div className="hero-buttons">
          <Link to="/exercises">
            <button className="btn solid">Explore Exercises</button>
        </Link>

          <Link to="/auth">
  <button className="btn outline">Sign In/Up</button>
</Link>
        </div>

        <a href="/" className="learn-more">
          Learn more about us →
        </a>
      </div>

      <div className="hero-image">
        <img
          src="/posture.png"
          alt="Exercise Pose"
          className="hero-img float"
        />
      </div>
    </section>
  );
}

export default Hero;