import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "./landing/Hero";
import Features from "./landing/Features";
import HowItWorks from "./landing/HowItWorks";
import Benefits from "./landing/Benefits";
import Testimonials from "./landing/Testimonials";
import Footer from "./landing/Footer";

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Landing;