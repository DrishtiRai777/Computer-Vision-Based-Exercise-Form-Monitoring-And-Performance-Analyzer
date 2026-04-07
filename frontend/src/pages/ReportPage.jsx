import React, { useEffect, useState } from "react";
import "./ReportPage.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from "recharts";

function ReportPage() {

  const [sessions, setSessions] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [exerciseData, setExerciseData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    console.log("useEffect triggered");

    const fetchSessionsFirst = async () => {

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found. User not authenticated.");
          return;
        }

        const res = await fetch("http://localhost:8000/sessions/user-session-info", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        console.log("Sessions response status:", res.status);

        const text = await res.text();

        if (!res.ok) {
          console.error("Sessions API failed");
          return;
        }

        const data = JSON.parse(text);

        const sessions = data.sessions || [];

        const exerciseData = getExerciseData(sessions);
        const dailyData = getDailyData(sessions);

        setSessions(sessions);
        setExerciseData(exerciseData);
        setDailyData(dailyData);


        const feedbackRes = await fetch("http://localhost:8000/users/overall-feedback", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        console.log("Feedback response status:", feedbackRes.status);

        const feedbackText = await feedbackRes.text();

        if (!feedbackRes.ok) {
          console.error("Feedback API failed");
          return;
        }

        const feedbackData = JSON.parse(feedbackText);

        setOverallFeedback(feedbackData.overall_feedback);

      } catch (err) {
        console.error("FETCH ERROR:", err);
      }
    };

    console.log("About to call fetchSessionsFirst");
    fetchSessionsFirst();

  }, []);


  const getExerciseData = (sessions) => {
    console.log("Processing exercise data");

    const map = {};

    sessions.forEach((s) => {
      const name = s.exercise_name;
      const time = Number(s.session_time) || 0;

      map[name] = (map[name] || 0) + time;
    });

    return Object.keys(map).map((key) => ({
      exercise: key,
      duration: map[key],
    }));
  };

  const getDailyData = (sessions) => {
    console.log("Processing daily data");

    const map = {};

    sessions.forEach((s) => {
      try {
  
        const date = s.created_at.split(", ")[1]?.split(" ")[0];
        const reps = Number(s.reps) || 0;

        if (date) {
          map[date] = (map[date] || 0) + reps;
        }
      } catch (e) {
        console.warn("Date parsing error:", s.created_at);
      }
    });

    return Object.keys(map).map((key) => ({
      date: key,
      reps: map[key],
    }));
  };

  return (
    <div className="report-wrapper">
      <div className="report-card">

        <h1 className="report-title">Posture Report</h1>

        <div className="report-section">
          <h3>Exercise-wise Duration</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={exerciseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exercise" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="duration" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="report-section">
          <h3>Daily Workout Duration</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="reps" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="report-section">
          <h3>Overall Feedback</h3>
          <p>{overallFeedback || "Generating feedback..."}</p>
        </div>

      </div>
    </div>
  );
}

export default ReportPage;