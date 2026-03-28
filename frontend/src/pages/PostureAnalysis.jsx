import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";

function PostureAnalysis() {
  const videoRef = useRef(null);
  const location = useLocation();
  const exerciseName = location.state?.exercise;

  const [feedback, setFeedback] = useState([]);

  const isInitialized = useRef(false);

  function calculateAngle(a, b, c) {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) -
      Math.atan2(a.y - b.y, a.x - b.x);

    let angle = Math.abs((radians * 180) / Math.PI);
    if (angle > 180) angle = 360 - angle;

    return angle;
  }

  function createPlankHandler(videoElement) {
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (!results.poseLandmarks) return;

      const lm = results.poseLandmarks;

      const leftVis = lm[11].visibility;
      const rightVis = lm[12].visibility;
      const side = leftVis > rightVis ? "LEFT" : "RIGHT";

      const map = {
        LEFT: { s: 11, e: 13, h: 23, a: 27, ear: 7 },
        RIGHT: { s: 12, e: 14, h: 24, a: 28, ear: 8 },
      };

      const ids = map[side];

      const shoulder = lm[ids.s];
      const elbow = lm[ids.e];
      const hip = lm[ids.h];
      const ankle = lm[ids.a];
      const ear = lm[ids.ear];

      const bodyAngle = calculateAngle(shoulder, hip, ankle);
      const armAngle = calculateAngle(elbow, shoulder, hip);
      const neckAngle = calculateAngle(ear, shoulder, hip);

      let newFeedback = [];

      if (bodyAngle < 165)
        newFeedback.push("Lift your hips – body sagging.");
      else if (bodyAngle > 185)
        newFeedback.push("Lower your hips – too high.");

      if (Math.abs(shoulder.x - elbow.x) > 0.05)
        newFeedback.push("Keep elbow under shoulder.");

      if (armAngle < 80 || armAngle > 100)
        newFeedback.push("Keep upper arm vertical.");

      if (neckAngle < 160)
        newFeedback.push("Keep neck neutral.");

      setFeedback(newFeedback);
    });

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await pose.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    camera.start();
    return camera;
  }

  const exerciseHandlers = {
    "Planks": createPlankHandler,
    
  };

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    let camera = null;

    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;

      const handler = exerciseHandlers[exerciseName];
      if (handler) {
        camera = handler(videoRef.current);
      }
    }

    startCamera();

    return () => {
      if (camera) camera.stop();

      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [exerciseName]);

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <div
          style={{
            display: "flex",
            gap: "20px",
            height: "100%",
            width: "100%",
          }}
        >
          <div
            className="camera-section"
            style={{
              flex: 1,
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <div
            className="feedback-panel"
            style={{
              flex: "0 0 280px",
              backgroundColor: "#f5f5f5",
              padding: "20px",
              borderRadius: "10px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "600" }}>
                Feedback
              </h3>
              {feedback.length === 0 ? (
                <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>No issues detected</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {feedback.map((item, index) => (
                    <li key={index} style={{ marginBottom: "10px", fontSize: "14px", color: "#333" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="button-footer">
          <button className="reset-btn">Reset</button>
          <button className="analyze-btn">Analyze</button>
        </div>
      </div>
    </div>
  );
}

export default PostureAnalysis;