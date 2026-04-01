import "./exercises.css";
import { FaPlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Exercises() {

  const exercises = [
    { name: "Lunges", img: "/lunges.png" },
    { name: "Planks", img: "/planks.png" },
    { name: "Pushups", img: "/pushups.png" },
    { name: "Squats", img: "/squats.png" },
    { name: "Glute Bridge", img: "/glute bridge.png" }
  ];
  const navigate = useNavigate();

const startExercise = (exerciseName) => {
  const token = localStorage.getItem("token");
  if(!token) {
    navigate("/login");
    return;
  }
  navigate("/analysis", { state: { exercise: exerciseName } });
};
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

            <button className="try-btn" onClick={() => startExercise(ex.name)}>
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