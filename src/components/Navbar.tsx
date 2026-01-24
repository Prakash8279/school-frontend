import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/school-logo.png";
import { useSelector } from "react-redux"; 
import { RootState } from "@/store"; 
import { User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { 
      name: "About us", 
      href: "#about",
      dropdown: [
        { name: "Our Mission", href: "/about/mission" },
        { name: "Our Vision", href: "/about/vision" },
        { name: "Chairman Message", href: "/about/chairman-message" },
        { name: "Secretary Message", href: "/about/secretary-message" },
        { name: "Principal Message", href: "/about/principal-message" },
      ]
    },
    { 
      name: "Admission", 
      href: "#contact",
      dropdown: [
        { name: "Admission Process", href: "/admission/process" },
        { name: "Fee Structure", href: "/admission/fee-structure" },
        { name: "Apply Online", href: "/admission/apply" },
      ]
    },
    { 
      name: "Academics", 
      href: "#about",
      dropdown: [
        { name: "Curriculum", href: "/academics/curriculum" },
        { name: "Time Table", href: "/academics/timetable" },
        { name: "Exam Schedule", href: "/academics/exam-schedule" },
      ]
    },
    { 
      name: "CBSE Mandatory", 
      href: "#",
      dropdown: [
        { name: "School Information", href: "/cbse/school-info" },
        { name: "Documents", href: "/cbse/documents" },
        { name: "Affiliation Status", href: "/cbse/affiliation" },
      ]
    },
    { name: "Gallery", href: "#gallery" },
    { name: "Contact us", href: "#contact" },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    setActiveDropdown(null);
    setActiveSubmenu(null);
    
    // If it's a page route (starts with /)
    if (href.startsWith('/')) {
      navigate(href);
      return;
    }
    
    // If it's a hash link
    if (location.pathname !== "/") {
      navigate("/");
      return;
    }

    // If we ARE on the home page, scroll to the section
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? "top-0 bg-slate-900 shadow-lg"
          : "top-[72px] bg-slate-900 shadow-md"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#home");
            }}
            className="flex items-center gap-3 group"
          >
            <img 
              src={logo} 
              alt="R.N.T. Public School" 
              className="h-10 w-10 object-contain group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">
                R.N.T. Public School
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative"
                onMouseEnter={() => setActiveDropdown(link.name)}
                onMouseLeave={() => {
                  setActiveDropdown(null);
                  setActiveSubmenu(null);
                }}
              >
                <a
                  href={link.href}
                  onClick={(e) => {
                    if (link.dropdown) {
                      e.preventDefault();
                    } else {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }
                  }}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium px-3 py-2 transition-colors cursor-pointer"
                >
                  {link.name}
                  {link.dropdown && <ChevronDown className="w-4 h-4" />}
                </a>
                
                {/* Dropdown Menu */}
                {link.dropdown && activeDropdown === link.name && (
                  <div className="absolute top-full left-0 bg-slate-800 min-w-[200px] shadow-xl rounded-b-md overflow-hidden">
                    {link.dropdown.map((item: any) => (
                      <div 
                        key={item.name} 
                        className="relative"
                        onMouseEnter={() => item.submenu && setActiveSubmenu(item.name)}
                        onMouseLeave={() => setActiveSubmenu(null)}
                      >
                        <a
                          href={item.href}
                          onClick={(e) => {
                            if (item.submenu) {
                              e.preventDefault();
                            } else {
                              e.preventDefault();
                              handleNavClick(item.href);
                              setActiveDropdown(null);
                            }
                          }}
                          className="flex items-center justify-between text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 px-4 py-3 transition-colors border-b border-slate-700 last:border-0"
                        >
                          {item.name}
                          {item.submenu && <ChevronRight className="w-4 h-4" />}
                        </a>
                        
                        {/* Submenu */}
                        {item.submenu && activeSubmenu === item.name && (
                          <div className="absolute top-0 left-full bg-slate-700 min-w-[200px] shadow-xl z-50">
                            {item.submenu.map((subItem: any) => (
                              <a
                                key={subItem.name}
                                href={subItem.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(subItem.href);
                                  setActiveDropdown(null);
                                  setActiveSubmenu(null);
                                }}
                                className="block text-emerald-400 hover:bg-slate-600 hover:text-emerald-300 px-4 py-3 transition-colors border-b border-slate-600 last:border-0 cursor-pointer"
                              >
                                {subItem.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {userInfo ? (
              <Button 
                variant="outline" 
                onClick={() => navigate("/dashboard")}
                className="flex gap-2 ml-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-slate-900"
              >
                <User className="w-4 h-4" />
                Dashboard
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold ml-2"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-emerald-400" />
            ) : (
              <Menu className="w-6 h-6 text-emerald-400" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-slate-800 border-t border-slate-700">
            <div className="flex flex-col py-2">
              {navLinks.map((link) => (
                <div key={link.name}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      if (link.dropdown) {
                        setActiveDropdown(activeDropdown === link.name ? null : link.name);
                      } else {
                        handleNavClick(link.href);
                      }
                    }}
                    className="flex items-center justify-between text-emerald-400 hover:bg-slate-700 font-medium py-3 px-4 transition-colors cursor-pointer"
                  >
                    {link.name}
                    {link.dropdown && <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === link.name ? 'rotate-180' : ''}`} />}
                  </a>
                  
                  {/* Mobile Dropdown */}
                  {link.dropdown && activeDropdown === link.name && (
                    <div className="bg-slate-900 pl-4">
                      {link.dropdown.map((item: any) => (
                        <div key={item.name}>
                          <a
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              if (item.submenu) {
                                setActiveSubmenu(activeSubmenu === item.name ? null : item.name);
                              } else {
                                handleNavClick(item.href);
                              }
                            }}
                            className="flex items-center justify-between text-emerald-400/80 hover:bg-slate-800 py-2 px-4 transition-colors"
                          >
                            {item.name}
                            {item.submenu && <ChevronRight className={`w-4 h-4 transition-transform ${activeSubmenu === item.name ? 'rotate-90' : ''}`} />}
                          </a>
                          
                          {/* Mobile Submenu */}
                          {item.submenu && activeSubmenu === item.name && (
                            <div className="bg-slate-950 pl-4">
                              {item.submenu.map((subItem: any) => (
                                <a
                                  key={subItem.name}
                                  href={subItem.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(subItem.href);
                                    setIsOpen(false);
                                    setActiveDropdown(null);
                                    setActiveSubmenu(null);
                                  }}
                                  className="block text-emerald-400/70 hover:bg-slate-900 py-2 px-4 transition-colors cursor-pointer"
                                >
                                  {subItem.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {userInfo ? (
                <div className="px-4 py-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigate("/dashboard");
                      setIsOpen(false);
                    }}
                    className="flex gap-2 w-full border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-slate-900"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                </div>
              ) : (
                <div className="px-4 py-2">
                  <Button 
                    variant="default" 
                    className="bg-emerald-500 hover:bg-emerald-600 w-full font-semibold"
                    onClick={() => {
                      navigate("/login");
                      setIsOpen(false);
                    }}
                  >
                    Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;