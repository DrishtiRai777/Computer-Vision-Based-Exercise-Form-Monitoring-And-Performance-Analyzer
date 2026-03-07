import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Footer from "./components/Footer";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";

import Exercises from "./pages/Exercises";
import AuthPage from "./pages/AuthPage";
import LoginPage from "./pages/LoginPage";

function Home() {
  return (
    <>
      <Hero />
      <About />
      <HowItWorks />
      <Features />
    </>
  );
}

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;