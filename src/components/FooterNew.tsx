import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/school-logo.png";
import { useNavigate, useLocation } from "react-router-dom";

const FooterNew = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const quickLinks = [
    { name: "Our Mission", href: "/about/mission", isPage: true },
    { name: "Our Vision", href: "/about/vision", isPage: true },
    { name: "Gallery", href: "#gallery", isPage: false },
    { name: "Contact Us", href: "#contact", isPage: false },
    { name: "Fee Structure", href: "/admission/fee-structure", isPage: true },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/share/1EJFvGouFU/", label: "Facebook", color: "hover:bg-blue-600" },
    { icon: Instagram, href: "https://www.instagram.com/rnt_public_school7061?igsh=dmNqcTJ4aDVuOHUy", label: "Instagram", color: "hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-sky-500" },
    { icon: Youtube, href: "https://youtube.com/@rntpublicschool9587?si=ARbnMGGTh4PKRcxV", label: "Youtube", color: "hover:bg-red-600" },
  ];

  const scrollTo = (href: string) => {
    // If not on home page, navigate to home first then scroll
    if (location.pathname !== "/") {
      navigate("/" + href);
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* School Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="R.N.T. Public School" className="h-14 w-14 object-contain bg-white rounded-lg p-1" />
              <div>
                <h3 className="font-bold text-lg">R.N.T. Public School</h3>
                <p className="text-xs text-slate-400">Nursery to 8th Grade</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Our school is not just a place of learning—it's a launchpad for the future where every child is empowered.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center transition-all ${social.color}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary rounded" />
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (link.isPage) {
                        navigate(link.href);
                        window.scrollTo(0, 0);
                      } else {
                        scrollTo(link.href);
                      }
                    }}
                    className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors group cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary rounded" />
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-slate-400">
                <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:+917061337068" className="hover:text-primary transition-colors block">+91 70613 37068</a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:rntpublics@gmail.com" className="hover:text-primary transition-colors">rntpublics@gmail.com</a>
              </li>
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <a 
                  href="https://maps.app.goo.gl/jx5t3qSrGjTLxv196" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  R.N.T Public School Janki Nagar
                </a>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Mon - Sat: 8 AM - 3 PM</span>
              </li>
            </ul>
          </div>

          {/* Admission CTA */}
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-primary rounded" />
              Admissions Open
            </h4>
            <p className="text-sm text-slate-400 mb-4">
              Enroll your child today for a bright future! Limited seats available.
            </p>
            <Button 
              onClick={() => navigate("/admission/apply")}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Apply Now 🎓
            </Button>
            <div className="mt-3 p-3 bg-slate-800 rounded-lg text-center">
              <p className="text-xs text-slate-400">For Admission Enquiry</p>
              <a href="tel:+917061337068" className="text-primary font-bold hover:underline block">+91 70613 37068</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-500">
            <p>© 2026 R.N.T. Public School. All Rights Reserved.</p>
            <p className="text-slate-400 font-medium">Developed by <span className="text-primary">Prakash Kumar Thakur</span></p>
            <p>Made with ❤️ for Better Education</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterNew;

