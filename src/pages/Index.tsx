import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import Hero3D from "@/components/Hero3D";
import NoticeBoard from "@/components/NoticeBoard";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import FooterNew from "@/components/FooterNew";
import { resetLandingPageContent } from "@/lib/landingPageContent";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Reset content to restore emojis - run once
    const hasReset = sessionStorage.getItem("contentReset4");
    if (!hasReset) {
      resetLandingPageContent();
      sessionStorage.setItem("contentReset4", "true");
      window.location.reload();
    }
  }, []);

  // Handle hash scroll when navigating from other pages
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen">
      <TopHeader />
      <Navbar />
      <Hero3D />
      <NoticeBoard />
      <About />
      <Gallery />
      <Contact />
      <FooterNew />
    </div>
  );
};

export default Index;
