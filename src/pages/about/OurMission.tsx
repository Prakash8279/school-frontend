import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { Target, CheckCircle } from "lucide-react";

const OurMission = () => {
  const missionPoints = [
    "To provide quality education that nurtures intellectual curiosity and creativity",
    "To develop moral values and ethical behavior in students",
    "To create a safe and supportive learning environment",
    "To encourage critical thinking and problem-solving skills",
    "To prepare students for the challenges of the modern world",
    "To foster respect for diversity and cultural heritage",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <Target className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Mission</h1>
              <p className="text-xl text-gray-600">Shaping Future Leaders Through Excellence in Education</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                At R.N.T. Public School, our mission is to provide a holistic education that empowers 
                students to become responsible citizens, lifelong learners, and compassionate individuals. 
                We strive to create an environment where every child can discover their potential and 
                achieve their dreams.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Core Mission Values</h2>
              
              <div className="space-y-4">
                {missionPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white">
                <p className="text-lg font-medium text-center">
                  "Education is the most powerful weapon which you can use to change the world."
                </p>
                <p className="text-center mt-2 text-blue-200">- Nelson Mandela</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterNew />
    </div>
  );
};

export default OurMission;
