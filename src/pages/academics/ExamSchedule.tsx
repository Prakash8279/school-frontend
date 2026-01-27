import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { FileText, Calendar, AlertCircle, CheckCircle } from "lucide-react";

const ExamSchedule = () => {
  const examSchedule = [
    { 
      name: "Unit Test 1", 
      month: "May 2026", 
      classes: "All Classes",
      status: "upcoming"
    },
    { 
      name: "Half Yearly Exam", 
      month: "September 2026", 
      classes: "All Classes",
      status: "upcoming"
    },
    { 
      name: "Unit Test 2", 
      month: "December 2026", 
      classes: "All Classes",
      status: "upcoming"
    },
    { 
      name: "Annual Exam", 
      month: "March 2027", 
      classes: "All Classes",
      status: "upcoming"
    },
  ];

  const examPattern = [
    { class: "Nursery - UKG", pattern: "Oral + Activity Based Assessment" },
    { class: "Class 1-2", pattern: "Oral + Written (Simple)" },
    { class: "Class 3-5", pattern: "Written Exam + Project Work" },
    { class: "Class 6-8", pattern: "Written Exam + Practical + Project" },
  ];

  const guidelines = [
    "Students must bring their own stationery for exams",
    "No electronic devices allowed in examination hall",
    "Reach school 30 minutes before exam starts",
    "Admit card is mandatory for all exams",
    "Re-exam only in case of medical emergency with valid certificate",
    "Minimum 75% attendance required to appear in exams",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <FileText className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Exam Schedule</h1>
              <p className="text-xl text-gray-600">Academic Year 2026-27</p>
            </div>

            {/* Exam Schedule */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
                <h2 className="text-xl font-bold text-center">Examination Schedule 2026-27</h2>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {examSchedule.map((exam, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border-l-4 border-red-500">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800">{exam.name}</h3>
                          <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                            <Calendar className="w-4 h-4" />
                            {exam.month}
                          </p>
                          <p className="text-gray-500 text-sm">{exam.classes}</p>
                        </div>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                          Upcoming
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exam Pattern */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Examination Pattern</h2>
              <div className="space-y-4">
                {examPattern.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <span className="font-medium text-gray-800">{item.class}</span>
                    <span className="text-blue-600">{item.pattern}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-xl text-center">
                  <p className="text-3xl font-bold text-green-600">80%</p>
                  <p className="text-sm text-gray-600">Written Exam</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl text-center">
                  <p className="text-3xl font-bold text-purple-600">10%</p>
                  <p className="text-sm text-gray-600">Project Work</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl text-center">
                  <p className="text-3xl font-bold text-orange-600">10%</p>
                  <p className="text-sm text-gray-600">Class Participation</p>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                Exam Guidelines
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {guidelines.map((guideline, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{guideline}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                <p className="text-amber-700 text-sm">
                  <strong>Note:</strong> Detailed date sheet will be shared 15 days before each examination. 
                  Parents are requested to ensure students prepare well in advance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterNew />
    </div>
  );
};

export default ExamSchedule;
