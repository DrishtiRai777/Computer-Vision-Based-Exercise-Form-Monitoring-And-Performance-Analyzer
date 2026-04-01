import { useEffect, useRef, useState } from "react";
import { data, useLocation, useNavigate } from "react-router-dom";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { sendSessionSnapshot } from "../services/sessionService";
import { getFeedbackMap } from "../utils/feedback";

function PostureAnalysis() {
  const feedbackHistoryRef = useRef([]);
  const [repsCount, setReps] = useState(0);
  const videoRef = useRef(null);
  const location = useLocation();
  const exerciseName = location.state?.exercise;
 

  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [exerciseStarted, setExerciseStarted] = useState(false); // true after countdown
  const [exerciseTime, setExerciseTime] = useState(0); // counts seconds after start
  const [countdown, setCountdown] = useState(5);
  const [hasStarted, setHasStarted] = useState(false); 
  const [isFinished, setIsFinished] = useState(false);


  const isInitialized = useRef(false);

  const cameraRef = useRef(null);
  const streamRef = useRef(null);
  useEffect(() => {
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);
  useEffect(() => {
  let interval;

  if (exerciseStarted) {
    interval = setInterval(() => {
      const snapshot = {
        feedback: getFeedbackMap(feedbackHistoryRef.current),
      };
      console.log("5 MIN SNAPSHOT", {
        feedback: getFeedbackMap(feedbackHistoryRef.current),
      });

      sendSessionSnapshot(snapshot);

      // reset feedback
      feedbackHistoryRef.current = [];
    },  5 * 60 * 1000); 
  }
  return () => clearInterval(interval);
}, [exerciseStarted]);

  function calculateAngle(a, b, c) {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) -
      Math.atan2(a.y - b.y, a.x - b.x);

    let angle = Math.abs((radians * 180) / Math.PI);
    if (angle > 180) angle = 360 - angle;

    return angle;
  }

  function createSquatHandler(videoElement) {
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
  
    let counter = 0;
    let stage = "UP";
    let bottomReached = false;
  
    let prevKneeAngle = null;
    let hipStartY = null;
    let startKneeAngle = null;
  
    let bottomFrames = 0;
    const MIN_BOTTOM_FRAMES = 3;
  
    // thresholds
    const UP_THRESHOLD = 165;
    const HIP_DROP_REQUIRED = 0.08;
    const MIN_ANGLE_DROP = 40;
  
    pose.onResults((results) => {
      if (!results.poseLandmarks) {
        stage = "UP";
        bottomReached = false;
        hipStartY = null;
        startKneeAngle = null;
        bottomFrames = 0;
        setFeedback(["No person detected"]);
        return;
      }
  
      const lm = results.poseLandmarks;
  
      const side =
        lm[11].visibility > lm[12].visibility ? "LEFT" : "RIGHT";
  
      const map = {
        LEFT: { s: 11, h: 23, k: 25, a: 27 },
        RIGHT: { s: 12, h: 24, k: 26, a: 28 },
      };
  
      const ids = map[side];
  
      const shoulder = lm[ids.s];
      const hip = lm[ids.h];
      const knee = lm[ids.k];
      const ankle = lm[ids.a];
  
      const kneeAngle = calculateAngle(hip, knee, ankle);
  
      const vertical = { x: hip.x, y: hip.y - 0.1 };
      const backAngle = calculateAngle(shoulder, hip, vertical);
  
      if (prevKneeAngle === null) prevKneeAngle = kneeAngle;
  
      const delta = kneeAngle - prevKneeAngle;
      const descending = delta < -2;
      const ascending = delta > 2;
  
      prevKneeAngle = kneeAngle;
  
      const hipY = hip.y;
  
      if (
        stage === "UP" &&
        hipStartY === null &&
        kneeAngle > 165
      ) {
        hipStartY = hipY;
        startKneeAngle = kneeAngle;
      }
  
      let hipDrop = 0;
      if (hipStartY !== null) {
        hipDrop = hipY - hipStartY;
      }
  
      let angleDrop = 0;
      if (startKneeAngle !== null) {
        angleDrop = startKneeAngle - kneeAngle;
      }
  
      // all Conditions
      const correctDepth = kneeAngle < 100;
      const hipsLowEnough = hipDrop > HIP_DROP_REQUIRED;
      const backOk = backAngle > 25 && backAngle < 70;
      const kneesOk = Math.abs(knee.x - ankle.x) < 0.12;
      const enoughMovement = angleDrop > MIN_ANGLE_DROP;
  
      const correctSquat =
        correctDepth &&
        hipsLowEnough &&
        backOk &&
        kneesOk &&
        enoughMovement;
  
      
      // Rep counting
      if (stage === "UP" && kneeAngle < 140) {
        stage = "DOWN";
        bottomFrames = 0;
      }
  
      if (stage === "DOWN" && correctSquat) {
        bottomFrames++;
      } else {
        bottomFrames = 0;
      }
  
      if (bottomFrames >= MIN_BOTTOM_FRAMES) {
        bottomReached = true;
      }
  
      if (
        stage === "DOWN" &&
        kneeAngle > UP_THRESHOLD
      ) {
        if (bottomReached) {
          counter++;
        }
  
        stage = "UP";
        bottomReached = false;
        hipStartY = null;
        startKneeAngle = null;
        bottomFrames = 0;
      }
  
      // Feedback
      let messages = [];
  
      if (stage === "DOWN") {
        if (!correctDepth) messages.push("Go lower");
        if (!hipsLowEnough) messages.push("Lower hips");
        if (!backOk) messages.push("Fix back");
        if (!kneesOk) messages.push("Knees forward");
  
        if (correctSquat) messages.push("Good squat");
      } else {
        messages.push("Start squat");
      }
  
      messages.push(`Reps: ${counter}`);
      setFeedback(messages);
      //aggregating feedback
      const filtered = messages.filter(m => !m.startsWith("Reps"));
      feedbackHistoryRef.current.push(...filtered);

      setReps(counter);
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

      //aggregating feedback
      feedbackHistoryRef.current.push(...newFeedback);
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

  function createPushupHandler(videoElement) {
  const pose = new Pose({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });

  let counter = 0;
  let stage = "UP";

  let started = false; // 🔥 gate control
  let stableFrames = 0;

  let prevAngle = null;
  let bottomReached = false;
  let bottomFrames = 0;

  const START_FRAMES = 10; // stability before starting
  const MIN_BOTTOM_FRAMES = 3;

  const UP_THRESHOLD = 165;
  const DOWN_THRESHOLD = 85;

  pose.onResults((results) => {
    if (!results.poseLandmarks) {
      setFeedback(["No person detected"]);
      return;
    }

    const lm = results.poseLandmarks;

    const side =
      lm[11].visibility > lm[12].visibility ? "LEFT" : "RIGHT";

    const map = {
      LEFT: { s: 11, e: 13, w: 15, h: 23, a: 27 },
      RIGHT: { s: 12, e: 14, w: 16, h: 24, a: 28 },
    };

    const ids = map[side];

    const shoulder = lm[ids.s];
    const elbow = lm[ids.e];
    const wrist = lm[ids.w];
    const hip = lm[ids.h];
    const ankle = lm[ids.a];

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    const backAngle = calculateAngle(shoulder, hip, ankle);

    const goodPosture = backAngle > 160 && backAngle < 190;

    let messages = [];

    // ----------------------------------
    // 🟡 PHASE 1: WAIT FOR GOOD POSTURE
    // ----------------------------------
    if (!started) {
      if (goodPosture) {
        stableFrames++;
        messages.push("Hold straight body...");
      } else {
        stableFrames = 0;
        messages.push("Get into pushup position (straight body)");
      }

      if (stableFrames >= START_FRAMES) {
        started = true;
        messages = ["Start pushups ✅"];
      }

      setFeedback(messages);
      return;
    }

    // ----------------------------------
    // 🔵 PHASE 2: MOVEMENT TRACKING
    // ----------------------------------
    if (prevAngle !== null) {
      if (elbowAngle < prevAngle - 2) {
        stage = "DOWN";
      } else if (elbowAngle > prevAngle + 2) {
        stage = "UP";
      }
    }

    prevAngle = elbowAngle;

    // ----------------------------------
    // 🔽 BOTTOM DETECTION
    // ----------------------------------
    if (stage === "DOWN" && elbowAngle < DOWN_THRESHOLD) {
      bottomFrames++;
    } else {
      bottomFrames = 0;
    }

    if (bottomFrames >= MIN_BOTTOM_FRAMES) {
      bottomReached = true;
    }

    // ----------------------------------
    // 🔢 REP COUNT (STRICT)
    // ----------------------------------
    if (
      stage === "UP" &&
      elbowAngle > UP_THRESHOLD &&
      bottomReached &&
      goodPosture
    ) {
      counter++;
      bottomReached = false;
      bottomFrames = 0;
    }

    // ----------------------------------
    // 🔴 FEEDBACK SYSTEM (MULTIPLE)
    // ----------------------------------

    if (!goodPosture) {
      if (backAngle < 160) {
        messages.push("Keep your back straight");
      }
      if (backAngle > 190) {
        messages.push("Don't raise hips too high");
      }
    }

    if (stage === "DOWN" && elbowAngle > 95) {
      messages.push("Go lower");
    }

    if (Math.abs(shoulder.x - wrist.x) > 0.15) {
      messages.push("Keep hands under shoulders");
    }

    // default
    if (messages.length === 0) {
      messages.push("Good form 👍");
    }

    messages.push(`Reps: ${counter}`);

    setFeedback(messages);
    
    // aggregating feedback 
    const filtered = messages.filter(m => !m.startsWith("Reps"));
    feedbackHistoryRef.current.push(...filtered);
    setReps(counter);
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
    "Squats": createSquatHandler,
    "Pushups": createPushupHandler 
  };

  
  useEffect(() => {
  // 🔹 START CAMERA ONLY ONCE
  if (!isInitialized.current) {
    isInitialized.current = true;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      });
  }

  let countdownInterval;
  let exerciseInterval;

  // 🔹 START COUNTDOWN ONLY AFTER BUTTON CLICK
  if (hasStarted) {
    setCountdown(5);

    countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);

          setExerciseStarted(true);
          const handler = exerciseHandlers[exerciseName];
          if (handler) {
            cameraRef.current = handler(videoRef.current);
          }
          exerciseInterval = setInterval(() => {
            setExerciseTime((prev) => prev + 1);
          }, 1000);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return () => {
    clearInterval(countdownInterval);
    clearInterval(exerciseInterval);
  };
}, [hasStarted, exerciseName]);


  const handleFinish = async () => {
    const finalSnapshot = {
      feedback: getFeedbackMap(feedbackHistoryRef.current),
      reps: repsCount,
      total_time: exerciseTime,
      exercise: exerciseName,
    };

    const data = await sendSessionSnapshot(finalSnapshot);
    feedbackHistoryRef.current = [];
    setReportData(data);

    setExerciseStarted(false);
    setIsFinished(true);
    setHasStarted(false);
  };

  const handleReport = () => {
     if (!reportData) {
      alert("No report available yet");
      return;
    }

    navigate("/sessionReport", { state: reportData }); 
  }

const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "36px",
    fontWeight: "700",
    textAlign: "center",
    zIndex: 10,
    borderRadius: "10px",
  }; 
  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <div
          style={{
            display: "flex",
            gap: "20px",
            height: "100%",
            width: "100%",
            position: "relative",
          }}
        >
          {/* CAMERA SECTION */}
          <div
            className="camera-section"
            style={{
              flex: 1,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Video Feed */}
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

            {/* BEFORE START */}
            {!hasStarted && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "36px",
                  fontWeight: "700",
                  textAlign: "center",
                  zIndex: 10,
                  borderRadius: "10px",
                }}
              >
                <p style={{ fontSize: "28px" }}>Click Start to begin</p>
              </div>
            )}

            {/* COUNTDOWN */}
            {hasStarted && !exerciseStarted && countdown > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "36px",
                  fontWeight: "700",
                  textAlign: "center",
                  zIndex: 10,
                  borderRadius: "10px",
                }}
              >
                <p style={{ marginBottom: "20px", fontSize: "28px" }}>
                  Get ready! Take your position
                </p>
                <span>{countdown}</span>
              </div>
            )}

            {/* EXERCISE TIMER */}
            {exerciseStarted && (
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  right: "20px",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "white",
                  padding: "8px 15px",
                  borderRadius: "12px",
                  fontWeight: "600",
                  fontSize: "16px",
                  zIndex: 10,
                }}
              >
                {Math.floor(exerciseTime / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(exerciseTime % 60).toString().padStart(2, "0")}
              </div>
            )}
          </div>

          {/* FEEDBACK PANEL */}
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
              <h3
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Feedback
              </h3>

              {!exerciseStarted ? (
                <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                  Waiting for exercise to start...
                </p>
              ) : feedback.length === 0 ? (
                <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                  No issues detected
                </p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {feedback.map((item, index) => (
                    <li
                      key={index}
                      style={{
                        marginBottom: "10px",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* BUTTON FOOTER */}
        <div className="button-footer">
          <button
            className="reset-btn"
            onClick={() => {
             
              if (cameraRef.current) {
                cameraRef.current.stop();
              }

             
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
              }

              if (videoRef.current) {
                videoRef.current.srcObject = null;
              }

              navigate("/exercises");
            }}
          >
            ← Back
          </button>
          <button
            className="analyze-btn"
            onClick={() => {
              setHasStarted(true);
              setIsFinished(false);
              setExerciseTime(0);
              setReps(0);
            }}
          >
            ▶ Start
          </button>

          <button
            className="analyze-btn"
            disabled={!isFinished}
            style={{
              backgroundColor: isFinished ? "green" : "grey",
              cursor: isFinished ? "pointer" : "not-allowed",
            }}
            onClick={handleReport}
          >
            Analyze
          </button>
          <button className="analyze-btn" onClick={handleFinish}>
            ✔ Finish Exercise
          </button>
        </div>
      </div>
    </div>
  );
}
export default PostureAnalysis;
