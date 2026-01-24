import { Bell, ChevronRight, Calendar, Award, BookOpen, Users, Bus, Monitor, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const NoticeBoard = () => {
  const notices = [
    { id: 1, title: "Upcoming Exam Schedule", type: "latest", date: "25 Jan 2026" },
    { id: 2, title: "Exam Results Announcement", type: "upcoming", date: "Coming Soon" },
    { id: 3, title: "Republic Day Ceremony", type: "new", date: "26 Jan 2026" },
    { id: 4, title: "Parent Teacher Meeting", type: "upcoming", date: "28 Jan 2026" },
    { id: 5, title: "Annual Sports Day", type: "new", date: "30 Jan 2026" },
  ];

  const features = [
    { icon: BookOpen, title: "Quality Education", desc: "CBSE Curriculum", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Users, title: "Expert Faculty", desc: "Experienced Teachers", color: "text-green-500", bg: "bg-green-50" },
    { icon: Monitor, title: "Smart Classes", desc: "Digital Learning", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: Bus, title: "Transport", desc: "Safe Bus Service", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: Trophy, title: "Sports", desc: "Extra Activities", color: "text-red-500", bg: "bg-red-50" },
    { icon: Sparkles, title: "Modern Labs", desc: "Science & Computer", color: "text-cyan-500", bg: "bg-cyan-50" },
  ];

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "latest": return "bg-red-500 text-white";
      case "upcoming": return "bg-amber-500 text-white";
      case "new": return "bg-green-500 text-white";
      default: return "bg-primary text-white";
    }
  };

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      {/* Decorative blurred circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl animate-pulse-color" />
      <div className="absolute top-20 right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse-color" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-tertiary/20 rounded-full blur-2xl animate-pulse-color" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-quaternary/20 rounded-full blur-3xl animate-pulse-color" style={{ animationDelay: "1.5s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Notice Board - 2 cols */}
          <Card className="lg:col-span-2 border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5" />
                Notice Board
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[320px] overflow-y-auto">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-blue-600 transition-colors">
                        {notice.title}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {notice.date}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getBadgeStyle(notice.type)} text-[10px] px-1.5 py-0.5 flex-shrink-0`}>
                    {notice.type === "latest" ? "Latest" : notice.type === "upcoming" ? "Soon" : "New"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Why Choose Us - 3 cols */}
          <Card className="lg:col-span-3 border-0 shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="w-5 h-5" />
                Why R.N.T. Public School?
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`${feature.bg} p-3 rounded-xl hover:shadow-md transition-all cursor-pointer group hover:scale-[1.02]`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                      <span className="font-semibold text-sm text-slate-800">{feature.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 pl-7">{feature.desc}</p>
                  </div>
                ))}
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">500+</p>
                  <p className="text-xs text-muted-foreground">Happy Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">25+</p>
                  <p className="text-xs text-muted-foreground">Expert Teachers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">15+</p>
                  <p className="text-xs text-muted-foreground">Years Excellence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NoticeBoard;
