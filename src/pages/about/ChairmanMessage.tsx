import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { Quote } from "lucide-react";

const ChairmanMessage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Chairman's Message</h1>
              <p className="text-xl text-gray-600">Words of Wisdom from Our Leader</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-blue-600">CM</span>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold">Shri Ram Nath Tiwari</h2>
                    <p className="text-blue-200">Chairman, R.N.T. Public School</p>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <Quote className="w-12 h-12 text-blue-200 mb-4" />
                
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Dear Parents and Students,
                  </p>
                  <p>
                    It gives me immense pleasure to welcome you to R.N.T. Public School, an institution 
                    committed to excellence in education and holistic development of young minds.
                  </p>
                  <p>
                    Education is not merely about acquiring knowledge; it is about building character, 
                    developing critical thinking, and preparing our children to face the challenges of 
                    tomorrow. At R.N.T. Public School, we believe in nurturing the whole child – 
                    intellectually, emotionally, socially, and physically.
                  </p>
                  <p>
                    Our dedicated team of educators works tirelessly to create an environment where 
                    every student feels valued, supported, and inspired to reach their full potential. 
                    We combine traditional values with modern teaching methodologies to provide a 
                    well-rounded education.
                  </p>
                  <p>
                    I invite you to be a part of our growing family and together, let us shape the 
                    future of our nation through quality education.
                  </p>
                  <p className="font-semibold mt-6">
                    With warm regards,<br />
                    Shri Ram Nath Tiwari<br />
                    Chairman
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterNew />
    </div>
  );
};

export default ChairmanMessage;
