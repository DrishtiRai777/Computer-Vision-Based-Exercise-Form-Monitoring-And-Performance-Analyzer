import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";


function PostureAnalysis() {

  const videoRef = useRef(null);
  const location = useLocation();

  const exerciseName = location.state?.exercise;

  useEffect(() => {

    async function startCamera() {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    }

    startCamera();

  }, []);

  return (

  <div className="analysis-page">
  <div className="analysis-container">

    <div className="camera-section">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="camera-video"
      />
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