import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { FileText, Download, ExternalLink, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Documents = () => {
  const documents = [
    { 
      name: "CBSE Affiliation Letter", 
      description: "Official affiliation certificate from CBSE",
      type: "PDF",
      size: "245 KB"
    },
    { 
      name: "Society Registration Certificate", 
      description: "Registration under Societies Act",
      type: "PDF",
      size: "180 KB"
    },
    { 
      name: "NOC from State Government", 
      description: "No Objection Certificate from UP Govt",
      type: "PDF",
      size: "320 KB"
    },
    { 
      name: "Recognition Certificate", 
      description: "Recognition from Education Department",
      type: "PDF",
      size: "210 KB"
    },
    { 
      name: "Building Safety Certificate", 
      description: "Fire safety and structural stability certificate",
      type: "PDF",
      size: "156 KB"
    },
    { 
      name: "Land Certificate", 
      description: "Land ownership/lease documents",
      type: "PDF",
      size: "420 KB"
    },
    { 
      name: "Fee Structure", 
      description: "Class-wise fee details for current session",
      type: "PDF",
      size: "98 KB"
    },
    { 
      name: "Academic Calendar", 
      description: "Annual academic calendar 2026-27",
      type: "PDF",
      size: "145 KB"
    },
  ];

  const committees = [
    "School Managing Committee",
    "Parent Teacher Association",
    "Grievance Redressal Committee",
    "Anti-Ragging Committee",
    "Sexual Harassment Committee",
    "Health & Wellness Committee",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <FileText className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Documents</h1>
              <p className="text-xl text-gray-600">CBSE Mandatory Documents & Certificates</p>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Documents</h2>
              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{doc.name}</h3>
                        <p className="text-sm text-gray-500">{doc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">{doc.type} • {doc.size}</span>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Committees */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                School Committees
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {committees.map((committee, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <span className="text-gray-700">{committee}</span>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* CBSE Links */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">CBSE Official Links</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <a href="https://www.cbse.gov.in" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                  CBSE Official Website
                </a>
                <a href="https://cbseaff.nic.in" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                  CBSE Affiliation Portal
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterNew />
    </div>
  );
};

export default Documents;
