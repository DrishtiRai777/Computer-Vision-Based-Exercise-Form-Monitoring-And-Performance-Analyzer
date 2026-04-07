import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Footer from "./components/Footer";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";

import Exercises from "./pages/Exercises";
import AuthPage from "./pages/AuthPage";
import LoginPage from "./pages/LoginPage";
import PostureAnalysis from "./pages/PostureAnalysis";
import ReportPage from "./pages/ReportPage";
import SessionReport from "./pages/SessionReport"

import Layout from "./Layout";

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
    <GoogleOAuthProvider clientId="370998476708-etqjfo17tem9fvedq1auert06skp2se7.apps.googleusercontent.com">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/analysis" element={<PostureAnalysis />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/sessionReport" element={<SessionReport />} />
          </Routes>
        </Layout>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;