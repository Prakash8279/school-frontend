import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { FileText, Users, Calendar, CheckCircle, ClipboardList, GraduationCap } from "lucide-react";

const AdmissionProcess = () => {
  const steps = [
    { 
      icon: FileText, 
      title: "Step 1: Get Prospectus", 
      desc: "Collect the school prospectus and admission form from the school office or download from website",
      color: "bg-blue-500"
    },
    { 
      icon: ClipboardList, 
      title: "Step 2: Fill Application", 
      desc: "Complete the admission form with all required details and attach necessary documents",
      color: "bg-green-500"
    },
    { 
      icon: Calendar, 
      title: "Step 3: Submit Form", 
      desc: "Submit the filled form along with documents and registration fee at the school office",
      color: "bg-purple-500"
    },
    { 
      icon: Users, 
      title: "Step 4: Interaction", 
      desc: "Attend the parent-student interaction session with the Principal",
      color: "bg-orange-500"
    },
    { 
      icon: CheckCircle, 
      title: "Step 5: Admission Confirmation", 
      desc: "Upon selection, complete the admission formalities and fee payment",
      color: "bg-teal-500"
    },
    { 
      icon: GraduationCap, 
      title: "Step 6: Welcome!", 
      desc: "Collect books, uniform details and welcome kit. Your child is now part of RNT family!",
      color: "bg-pink-500"
    },
  ];

  const documents = [
    "Birth Certificate (Original + Photocopy)",
    "Aadhar Card of Student (Photocopy)",
    "Aadhar Card of Parents (Photocopy)",
    "Transfer Certificate (for Class 2 onwards)",
    "Previous Class Marksheet",
    "4 Passport Size Photographs",
    "Address Proof",
    "Caste Certificate (if applicable)",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Admission Process</h1>
              <p className="text-xl text-gray-600">Join the R.N.T. Public School Family</p>
            </div>

            {/* Admission Open Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-12 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">🎉 Admissions Open for 2026-27!</h2>
              <p>Nursery to Class 8 | Limited Seats Available</p>
            </div>

            {/* Steps */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Admission Steps</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                  <div key={index} className="relative p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                    <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mb-4`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Required */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Documents Required</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-2">📞 Contact for Admission</h3>
                <p className="text-amber-700">Phone: +91-7061337068</p>
                <p className="text-amber-700">Email: rntpublics@gmail.com</p>
                <p className="text-amber-700">Office Hours: 9:00 AM - 3:00 PM (Mon-Sat)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterNew />
    </div>
  );
};

export default AdmissionProcess;
