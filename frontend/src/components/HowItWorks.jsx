import { CheckCircle, Camera, Activity, Smartphone } from "lucide-react";

const steps = [
  {
    icon: <CheckCircle size={40} />,
    title: "Step 1",
    text: "Choose Exercise",
  },
  {
    icon: <Camera size={40} />,
    title: "Step 2",
    text: "Start Camera",
  },
  {
    icon: <Activity size={40} />,
    title: "Step 3",
    text: "AI Detects Posture",
  },
  {
    icon: <Smartphone size={40} />,
    title: "Step 4",
    text: "Get Feedback",
  },
];

function HowItWorks() {
  return (
    <section className="how-section">
      <h2>How It Works</h2>

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step-card">
            <div className="icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;