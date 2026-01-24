import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { School, MapPin, Phone, Mail, Globe, Building } from "lucide-react";

const SchoolInformation = () => {
  const schoolInfo = [
    { label: "School Name", value: "R.N.T. Public School" },
    { label: "Affiliation No.", value: "2100XXX" },
    { label: "School Code", value: "65247" },
    { label: "Affiliation Status", value: "Affiliated to CBSE, New Delhi" },
    { label: "Affiliation Period", value: "2020-2025 (Extended)" },
    { label: "Category", value: "Co-Educational" },
    { label: "Classes", value: "Nursery to Class 7" },
    { label: "Medium", value: "English / Hindi" },
    { label: "Year of Establishment", value: "2010" },
    { label: "School Area", value: "2 Acres" },
  ];

  const contactInfo = [
    { icon: MapPin, label: "Address", value: "R.N.T Public School Janki Nagar", link: "https://maps.app.goo.gl/jx5t3qSrGjTLxv196" },
    { icon: Phone, label: "Phone", value: "+91 70613 37068", link: "tel:+917061337068" },
    { icon: Mail, label: "Email", value: "rntpublics@gmail.com", link: "mailto:rntpublics@gmail.com" },
    { icon: Globe, label: "Website", value: "www.rntpublicschool.com", link: "https://www.rntpublicschool.com" },
  ];

  const facilities = [
    "Smart Classrooms with Projectors",
    "Computer Lab with Internet",
    "Science Laboratory",
    "Library with 5000+ Books",
    "Playground & Sports Facilities",
    "Safe Transport Service",
    "Pure Drinking Water (RO)",
    "CCTV Surveillance",
    "First Aid & Medical Room",
    "Activity Room",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <School className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">School Information</h1>
              <p className="text-xl text-gray-600">CBSE Mandatory Disclosure</p>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                <h2 className="text-xl font-bold text-center">General Information</h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {schoolInfo.map((info, index) => (
                    <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">{info.label}</span>
                      <span className="font-medium text-gray-800">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Building className="w-6 h-6 text-blue-600" />
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                    <info.icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">{info.label}</p>
                      {info.link ? (
                        <a 
                          href={info.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="font-medium text-gray-800">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">School Facilities</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {facilities.map((facility, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    <span className="text-gray-700">{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterNew />
    </div>
  );
};

export default SchoolInformation;
