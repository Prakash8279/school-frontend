import { useEffect } from "react";
import { Helmet } from "react-helmet";
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
    <>
      <Helmet>
        <title>R.N.T Public School, Janki Nagar Basabtpur</title>
        <meta name="description" content="R.N.T Public School, Janki Nagar Basabtpur - Best school for holistic education, experienced teachers, modern facilities, and a nurturing environment." />
        <meta name="keywords" content="RNT Public School, Janki Nagar Basabtpur, best school, admission, academics, facilities, education" />
        <meta property="og:title" content="R.N.T Public School, Janki Nagar Basabtpur" />
        <meta property="og:description" content="R.N.T Public School, Janki Nagar Basabtpur - Best school for holistic education, experienced teachers, modern facilities, and a nurturing environment." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.rntpublicschool.in/logo.png" />
      </Helmet>
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
    </>
  );
};

export default Index;
