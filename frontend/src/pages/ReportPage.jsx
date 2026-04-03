import React, { useEffect, useState } from "react";
import "./ReportPage.css";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from "recharts"



function ReportPage() {
  const CACHE_KEY = "report_cache";
  const ONE_DAY = 24 * 60 * 60 * 1000;
const getCache = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const parsed = JSON.parse(cached);

  const isExpired = Date.now() - parsed.timestamp > ONE_DAY;

  if (isExpired) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  return parsed;
};

const setCache = (data) => {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      ...data,
      timestamp: Date.now(),
    })
  );
};
  const [sessions, setSessions] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState("");

  const [exerciseData, setExerciseData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    const cached = getCache();
    if (cached) {
    console.log("Using cached data");

    setSessions(cached.sessions);
    setExerciseData(cached.exerciseData);
    setDailyData(cached.dailyData);
    setOverallFeedback(cached.overallFeedback);

    return; 
    }

    const fetchSessionsFirst = async () => {
      try {
        const res = await fetch("http://localhost:8000/user-session-info");
        const data = await res.json();
        const sessions = data.sessions || [];

        const exerciseData = getExerciseData(sessions);
        const dailyData = getDailyData(sessions);

        setSessions(sessions);
        setExerciseData(exerciseData);
        setDailyData(dailyData);

        const feedbackRes = await fetch("http://localhost:8000/overall-feedback", {
          method: "POST"
        });

        const feedbackData = await feedbackRes.json();
        setOverallFeedback(feedbackData.overall_feedback);
        
        setCache({
        sessions,
        exerciseData,
        dailyData,
        overallFeedback,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchSessionsFirst();
  }, []);

  const getExerciseData = (sessions) => {
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
  const map = {};

  sessions.forEach((s) => {
    const date = s.created_at.split(", ")[1].split(" ")[0];

    const reps = Number(s.reps) || 0;

    map[date] = (map[date] || 0) + reps;
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