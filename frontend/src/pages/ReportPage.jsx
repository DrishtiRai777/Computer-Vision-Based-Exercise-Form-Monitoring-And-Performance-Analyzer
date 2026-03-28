import React from "react";
import "./ReportPage.css";

function ReportPage() {
  // Dummy data (later you can replace with real ML results)
  const reportData = {
    exercise: "Squats",
    accuracy: "85%",
    mistakes: [
      "Knees going too forward",
      "Back not straight",
      "Incomplete squat depth"
    ],
    suggestion: "Keep your back straight and push hips backward."
  };

  return (
    <div className="report-wrapper">

      <div className="report-card">

        <h1 className="report-title">Posture Report</h1>

        <p className="report-subtitle">
          Your AI-based exercise analysis
        </p>

        {/* Exercise Info */}
        <div className="report-section">
          <h3>Exercise</h3>
          <p>{reportData.exercise}</p>
        </div>

        {/* Accuracy */}
        <div className="report-section">
          <h3>Accuracy</h3>
          <p className="accuracy">{reportData.accuracy}</p>
        </div>

        {/* Mistakes */}
        <div className="report-section">
          <h3>Mistakes Detected</h3>
          <ul>
            {reportData.mistakes.map((m, index) => (
              <li key={index}>{m}</li>
            ))}
          </ul>
        </div>

        {/* Suggestions */}
        <div className="report-section">
          <h3>Suggestions</h3>
          <p>{reportData.suggestion}</p>
        </div>

        {/* Button */}
        <button className="report-btn">
          Download Report
        </button>

      </div>

    </div>
  );
}

export default ReportPage;