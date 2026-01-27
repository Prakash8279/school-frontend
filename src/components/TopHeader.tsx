import { Phone, Mail, MapPin } from "lucide-react";

const TopHeader = () => {
  const announcements = [
    "Admissions Open for 2026-27 Session!",
    "100% Result in Board Exams",
    "Transport Facility Available",
    "New Smart Classrooms",
    "Affiliated School",
  ];

  return (
    <div className="relative z-[60]">
      {/* Top Info Bar - Dark */}
      <div className="bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2.5 text-xs">
            {/* Left - Contact */}
            <div className="flex items-center gap-4">
              <a href="tel:+917061337068" className="flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+91 70613 37068</span>
              </a>
              <a href="mailto:rntpublics@gmail.com" className="hidden md:flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                <Mail className="w-3.5 h-3.5" />
                <span>rntpublics@gmail.com</span>
              </a>
              <a 
                href="https://maps.app.goo.gl/jx5t3qSrGjTLxv196" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 text-slate-400 hover:text-orange-400 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>R.N.T Public School Janki Nagar</span>
              </a>
            </div>

            {/* Right - School Info & WhatsApp */}
            <div className="flex items-center gap-4">
              {/* <span className="hidden sm:inline text-slate-400">School Code: <strong className="text-white">65247</strong></span> */}
              <a 
                href="https://wa.me/917061337068?text=नमस्ते%2C%20मैं%20R.N.T.%20Public%20School%20में%20Admission%20के%20लिए%20Enquiry%20करना%20चाहता%2Fचाहती%20हूं।%20कृपया%20जानकारी%20दें।"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded font-bold transition-all hover:scale-105 text-white flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling News Ticker */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 overflow-hidden">
        <div className="py-2">
          <div className="marquee-wrapper">
            <div className="marquee-content text-white text-xs font-semibold tracking-wide">
              {[...announcements, ...announcements].map((text, i) => (
                <span key={i} className="mx-10 whitespace-nowrap flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .marquee-wrapper {
          overflow: hidden;
          width: 100%;
        }
        .marquee-content {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default TopHeader;
