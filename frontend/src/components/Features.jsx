import { Activity, Camera, BarChart, Shield } from "lucide-react";

const features = [
  {
    icon: <Camera size={40} />,
    title: "Real-time Camera Detection",
    text: "Analyze your posture instantly using your device camera.",
  },
  {
    icon: <Activity size={40} />,
    title: "AI Posture Recognition",
    text: "Our AI model detects body posture and movement accurately.",
  },
  {
    icon: <BarChart size={40} />,
    title: "Performance Tracking",
    text: "Track your exercise progress and posture improvements.",
  },
  {
    icon: <Shield size={40} />,
    title: "Safe & Guided Workouts",
    text: "Get feedback to reduce injury risk and improve form.",
  },
];

function Features() {
  return (
    <section className="features-section">
      <h2>Features</h2>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;