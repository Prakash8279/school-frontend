import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { Eye, Star } from "lucide-react";

const OurVision = () => {
  const visionPoints = [
    { title: "Academic Excellence", desc: "To be recognized as a center of academic excellence in the region" },
    { title: "Character Building", desc: "To develop students with strong moral values and integrity" },
    { title: "Innovation", desc: "To embrace modern teaching methods and technology" },
    { title: "Inclusivity", desc: "To provide equal opportunities for all students regardless of background" },
    { title: "Global Citizens", desc: "To prepare students to thrive in a globalized world" },
    { title: "Sustainable Future", desc: "To instill environmental awareness and responsibility" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
                <Eye className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Vision</h1>
              <p className="text-xl text-gray-600">Building Tomorrow's Leaders Today</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Our vision is to be a premier educational institution that inspires and nurtures young 
                minds to become confident, creative, and compassionate individuals who contribute 
                positively to society. We envision a school where every student discovers their unique 
                talents and achieves their fullest potential.
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Vision Pillars</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {visionPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                    <Star className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{point.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{point.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white">
                <p className="text-lg font-medium text-center">
                  "The future belongs to those who believe in the beauty of their dreams."
                </p>
                <p className="text-center mt-2 text-purple-200">- Eleanor Roosevelt</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterNew />
    </div>
  );
};

export default OurVision;
