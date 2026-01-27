import TopHeader from "@/components/TopHeader";
import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";
import { Clock, Calendar, Info } from "lucide-react";

const TimeTable = () => {
  const schoolTiming = {
    summer: { start: "7:30 AM", end: "1:30 PM", period: "April to September" },
    winter: { start: "8:45 AM", end: "2:00 PM", period: "October to March" },
  };

  const dailySchedule = [
    { time: "8:45 / 9:00", activity: "Morning Assembly", duration: "15 min" },
    { time: "9:00 / 9:45", activity: "1st Period", duration: "45 min" },
    { time: "9:45 / 10:30", activity: "2nd Period", duration: "45 min" },
    { time: "10:30 / 11:15", activity: "3rd Period", duration: "45 min" },
    { time: "11:15 / 12:00", activity: "4th Period", duration: "45 min" },
    { time: "12:00 / 12:30", activity: "Lunch Break", duration: "30 min" },
    { time: "12:30 / 1:15", activity: "5th Period", duration: "45 min" },
    { time: "1:15 / 2:00", activity: "6th Period", duration: "45 min" },
    
  ];

  const weeklyActivities = [
    { day: "Monday", activity: "Regular Classes + Sports" },
    { day: "Tuesday", activity: "Regular Classes + Art/Craft" },
    { day: "Wednesday", activity: "Regular Classes + Music" },
    { day: "Thursday", activity: "Regular Classes + Computer Lab" },
    { day: "Friday", activity: "Regular Classes + Library" },
    { day: "Saturday", activity: "Special Activities / PTM (Alternate)" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-primary/10 pattern-dots">
      <TopHeader />
      <Navbar />
      
      <div className="pt-40 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
                <Clock className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Time Table</h1>
              <p className="text-xl text-gray-600">Daily Schedule & Timings</p>
            </div>

            {/* School Timings */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">☀️ Summer Timing</h3>
                <p className="text-orange-100 mb-4">{schoolTiming.summer.period}</p>
                <div className="flex justify-between items-center bg-white/20 rounded-xl p-4">
                  <div>
                    <p className="text-sm text-orange-100">Start Time</p>
                    <p className="text-2xl font-bold">{schoolTiming.summer.start}</p>
                  </div>
                  <div className="text-3xl">→</div>
                  <div>
                    <p className="text-sm text-orange-100">End Time</p>
                    <p className="text-2xl font-bold">{schoolTiming.summer.end}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">❄️ Winter Timing</h3>
                <p className="text-blue-100 mb-4">{schoolTiming.winter.period}</p>
                <div className="flex justify-between items-center bg-white/20 rounded-xl p-4">
                  <div>
                    <p className="text-sm text-blue-100">Start Time</p>
                    <p className="text-2xl font-bold">{schoolTiming.winter.start}</p>
                  </div>
                  <div className="text-3xl">→</div>
                  <div>
                    <p className="text-sm text-blue-100">End Time</p>
                    <p className="text-2xl font-bold">{schoolTiming.winter.end}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Schedule */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
                <h2 className="text-xl font-bold text-center">Daily Schedule</h2>
                <p className="text-center text-purple-200 text-sm">Summer / Winter Timing</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Time</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Activity</th>
                      <th className="px-6 py-4 text-center text-gray-700 font-semibold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dailySchedule.map((item, index) => (
                      <tr key={index} className={`hover:bg-purple-50 transition-colors ${item.activity.includes('Break') ? 'bg-yellow-50' : ''}`}>
                        <td className="px-6 py-3 font-medium text-gray-800">{item.time}</td>
                        <td className="px-6 py-3 text-gray-600">{item.activity}</td>
                        <td className="px-6 py-3 text-center text-gray-500">{item.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Weekly Activities */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Weekly Schedule
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyActivities.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-bold text-purple-600">{item.day}</h3>
                    <p className="text-gray-600 text-sm mt-1">{item.activity}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700 text-sm">
                  Note: Class-wise detailed time table is provided at the beginning of each academic session. 
                  Parents are requested to ensure students reach school on time.
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

export default TimeTable;
