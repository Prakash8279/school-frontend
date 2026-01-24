import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { Quote } from "lucide-react";

const SecretaryMessage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Secretary's Message</h1>
              <p className="text-xl text-gray-600">A Message from Our Secretary</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-green-600">SM</span>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold">Shri Vijay Kumar</h2>
                    <p className="text-green-200">Secretary, R.N.T. Public School</p>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-12">
                <Quote className="w-12 h-12 text-green-200 mb-4" />
                
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Dear Parents and Well-wishers,
                  </p>
                  <p>
                    Greetings from R.N.T. Public School! It is with great pride that I address you as 
                    the Secretary of this esteemed institution.
                  </p>
                  <p>
                    Our school has always been committed to providing quality education at affordable 
                    costs. We believe that every child deserves access to excellent education, and we 
                    work hard to make this a reality.
                  </p>
                  <p>
                    The management is dedicated to continuously improving our infrastructure, facilities, 
                    and teaching methodologies. We have invested in smart classrooms, computer labs, and 
                    modern teaching aids to enhance the learning experience.
                  </p>
                  <p>
                    We are grateful for the trust parents place in us and assure you that we will 
                    continue to uphold the highest standards of education and care for your children.
                  </p>
                  <p className="font-semibold mt-6">
                    Best wishes,<br />
                    Shri Vijay Kumar<br />
                    Secretary
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

export default SecretaryMessage;
