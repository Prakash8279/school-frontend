import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { BookOpen, CheckCircle, Palette, Calculator, Globe, Beaker, Monitor, Music } from "lucide-react";

const Curriculum = () => {
  const subjects = [
    { icon: BookOpen, name: "English", desc: "Reading, Writing, Grammar, Literature", color: "bg-blue-500" },
    { icon: BookOpen, name: "Hindi", desc: "व्याकरण, साहित्य, लेखन", color: "bg-orange-500" },
    { icon: Calculator, name: "Mathematics", desc: "Numbers, Geometry, Problem Solving", color: "bg-green-500" },
    { icon: Beaker, name: "Science", desc: "Physics, Chemistry, Biology basics", color: "bg-purple-500" },
    { icon: Globe, name: "Social Studies", desc: "History, Geography, Civics", color: "bg-yellow-500" },
    { icon: Monitor, name: "Computer", desc: "Basic Computing, MS Office, Coding", color: "bg-cyan-500" },
    { icon: Palette, name: "Art & Craft", desc: "Drawing, Painting, Craft Work", color: "bg-pink-500" },
    { icon: Music, name: "Music & Dance", desc: "Vocal, Instrumental, Dance", color: "bg-indigo-500" },
  ];

  const features = [
    "CBSE curriculum following NCF guidelines",
    "Activity-based learning approach",
    "Regular assessments and feedback",
    "Focus on conceptual understanding",
    "Integration of technology in teaching",
    "Emphasis on practical learning",
    "Value education and life skills",
    "Sports and physical education",
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
                <BookOpen className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Curriculum</h1>
              <p className="text-xl text-gray-600">CBSE Affiliated Comprehensive Education</p>
            </div>

            {/* Subjects Grid */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Our Subjects</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {subjects.map((subject, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-all hover:scale-105">
                    <div className={`w-12 h-12 ${subject.color} rounded-full flex items-center justify-center mb-3`}>
                      <subject.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800">{subject.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{subject.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Features */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Curriculum Highlights</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                <h3 className="font-bold text-blue-800 mb-3">Academic Structure</h3>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold text-gray-800">Pre-Primary</h4>
                    <p className="text-sm text-gray-600">Nursery, LKG, UKG</p>
                    <p className="text-xs text-gray-500 mt-1">Play-based Learning</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold text-gray-800">Primary</h4>
                    <p className="text-sm text-gray-600">Class 1 to 5</p>
                    <p className="text-xs text-gray-500 mt-1">Foundation Building</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg">
                    <h4 className="font-bold text-gray-800">Middle School</h4>
                    <p className="text-sm text-gray-600">Class 6 to 8</p>
                    <p className="text-xs text-gray-500 mt-1">Advanced Learning</p>
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

export default Curriculum;
