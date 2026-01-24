import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { Quote } from "lucide-react";

const PrincipalMessage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Principal's Message</h1>
              <p className="text-xl text-gray-600">From the Desk of Our Principal</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-8 text-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-purple-600">PM</span>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold">Mrs. Sunita Sharma</h2>
                    <p className="text-purple-200">Principal, R.N.T. Public School</p>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <Quote className="w-12 h-12 text-purple-200 mb-4" />
                
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Dear Students and Parents,
                  </p>
                  <p>
                    Welcome to R.N.T. Public School! As the Principal, it is my privilege to lead 
                    this wonderful institution dedicated to shaping young minds.
                  </p>
                  <p>
                    At our school, we believe that every child is unique and has unlimited potential. 
                    Our role as educators is to identify, nurture, and develop this potential. We 
                    provide a stimulating environment where students are encouraged to explore, 
                    question, and learn.
                  </p>
                  <p>
                    Our curriculum goes beyond textbooks. We focus on developing 21st-century skills 
                    including critical thinking, creativity, communication, and collaboration. Our 
                    co-curricular activities ensure all-round development of students.
                  </p>
                  <p>
                    I believe in maintaining an open-door policy and welcome parents to share their 
                    feedback and suggestions. Together, we can ensure the best for our children.
                  </p>
                  <p className="font-semibold mt-6">
                    With best wishes,<br />
                    Mrs. Sunita Sharma<br />
                    Principal
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

export default PrincipalMessage;
