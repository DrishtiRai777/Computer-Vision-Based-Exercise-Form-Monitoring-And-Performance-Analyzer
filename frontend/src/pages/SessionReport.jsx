import { useLocation, useNavigate } from "react-router-dom";

function SessionReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportData = location.state;

  if (!reportData) {
    return (
      <div>
        <p>No report data available</p>
        <button onClick={() => navigate("/exercises")}>Go Back</button>
      </div>
    );
  }
  
    function formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds} sec`;
        } else if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return secs === 0 ? `${mins} min` : `${mins} min ${secs} sec`;
        } else {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            return mins === 0 ? `${hrs} hr` : `${hrs} hr ${mins} min`;
        }
    }

  return (
    <div className="report-wrapper">
      <div className="report-card">
        <h1 className="report-title">Session Report</h1>

        <div className="report-section">
          <h3>Exercise</h3>
          <p>{reportData.exercise}</p>
        </div>

        {reportData.exercise !== "Planks" && (
          <div className="report-section">
            <h3>Reps</h3>
            <p>{reportData.reps}</p>
          </div>
        )}

        <div className="report-section">
          <h3>Session Time</h3>
          <p>{formatTime(reportData.total_time)}</p>
        </div>

        <div className="report-section">
          <h3>Feedback</h3>
          <p>{reportData.feedback}</p>
        </div>
      </div>
    </div>
  );
}

export default SessionReport;