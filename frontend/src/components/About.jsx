import { Link } from "react-router-dom";

function About() {
  return (
    <section className="about">
      <div className="about-image">
        <div className="image-glow-wrapper">
          <img src="/nposture.png" alt="About" />
        </div>
      </div>

      <div className="about-text">
        <h2>About Us</h2>
        <p>
          We provide real-time posture tracking and
          exercise analysis to help improve body alignment,
          performance, and overall fitness experience.
        </p>

        <Link to="/exercises">
            <button className="btn solid">
                Explore Exercises
            </button>
        </Link>
      </div>
    </section>
  );
}

export default About;