import "./exercises.css";
import { FaPlay } from "react-icons/fa";

function Exercises() {

  const exercises = [
    { name: "Lunges", img: "/lunges.png" },
    { name: "Planks", img: "/planks.png" },
    { name: "Push Ups", img: "/pushups.png" },
    { name: "Squats", img: "/squats.png" },
    { name: "Glute Bridge", img: "/glute bridge.png" }
  ];

  return (
    <div className="exercise-page">

      <div className="exercise-header">
        <h1>Exercises</h1>
      </div>

      <div className="exercise-grid">

        {exercises.map((ex, index) => (
          <div className="exercise-card" key={index}>

            <img src={ex.img} alt={ex.name} />

            <h3>{ex.name}</h3>

            <button className="try-btn">
                <FaPlay style={{marginRight:"8px"}}/>
                    Try
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Exercises;