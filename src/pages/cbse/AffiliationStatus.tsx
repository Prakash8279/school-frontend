import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { Award, CheckCircle, Calendar, Building, MapPin } from "lucide-react";

const AffiliationStatus = () => {
  const affiliationDetails = [
    { label: "Affiliation Number", value: "2100XXX" },
    { label: "School Code", value: "65247" },
    { label: "Affiliation Status", value: "Provisional → Permanent (In Process)" },
    { label: "Affiliated Since", value: "2015" },
    { label: "Valid Up To", value: "March 2025 (Extension Applied)" },
    { label: "Category", value: "Secondary School (Upto Class 10 Applied)" },
    { label: "State", value: "Uttar Pradesh" },
    { label: "District", value: "Meerut" },
  ];

  const complianceStatus = [
    { item: "Land Requirement", status: "Compliant", note: "2 Acres" },
    { item: "Building Safety", status: "Compliant", note: "Certificate Valid" },
    { item: "Fire Safety", status: "Compliant", note: "NOC Obtained" },
    { item: "Sanitation", status: "Compliant", note: "Adequate Facilities" },
    { item: "Drinking Water", status: "Compliant", note: "RO System" },
    { item: "Library", status: "Compliant", note: "5000+ Books" },
    { item: "Science Lab", status: "Compliant", note: "Fully Equipped" },
    { item: "Computer Lab", status: "Compliant", note: "30+ Computers" },
    { item: "Playground", status: "Compliant", note: "Available" },
    { item: "Teacher Qualification", status: "Compliant", note: "As per CBSE norms" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
                <Award className="w-10 h-10 text-amber-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Affiliation Status</h1>
              <p className="text-xl text-gray-600">CBSE Affiliation Details</p>
            </div>

            {/* Status Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-12 text-white text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-8 h-8" />
                <h2 className="text-2xl font-bold">CBSE Affiliated School</h2>
              </div>
              <p>Recognized by Central Board of Secondary Education, New Delhi</p>
            </div>

            {/* Affiliation Details */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
                <h2 className="text-xl font-bold text-center">Affiliation Information</h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {affiliationDetails.map((detail, index) => (
                    <div key={index} className="flex justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">{detail.label}</span>
                      <span className="font-medium text-gray-800 text-right">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">CBSE Compliance Status</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {complianceStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">{item.item}</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">{item.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Affiliation Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full" />
                    <div className="w-0.5 h-full bg-blue-200" />
                  </div>
                  <div className="pb-8">
                    <p className="font-bold text-gray-800">2010 - School Established</p>
                    <p className="text-gray-600 text-sm">R.N.T. Public School founded</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full" />
                    <div className="w-0.5 h-full bg-blue-200" />
                  </div>
                  <div className="pb-8">
                    <p className="font-bold text-gray-800">2015 - CBSE Affiliation</p>
                    <p className="text-gray-600 text-sm">Provisional affiliation granted for Class 1-5</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full" />
                    <div className="w-0.5 h-full bg-blue-200" />
                  </div>
                  <div className="pb-8">
                    <p className="font-bold text-gray-800">2018 - Extension to Class 8</p>
                    <p className="text-gray-600 text-sm">Affiliation extended to middle school</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">2026 - Secondary Affiliation (Applied)</p>
                    <p className="text-gray-600 text-sm">Application submitted for Class 9-10</p>
                  </div>
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

export default AffiliationStatus;
