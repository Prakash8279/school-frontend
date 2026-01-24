import { useEffect, useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

// Import default images as fallback
import galleryFieldTrip1 from "@/assets/gallery-field-trip-1.jpeg";
import galleryAchievement from "@/assets/gallery-achievement.jpeg";
import galleryStudents1 from "@/assets/gallery-students-1.jpeg";
import galleryFieldTrip2 from "@/assets/gallery-field-trip-2.jpeg";
import galleryStudents2 from "@/assets/gallery-students-2.jpeg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const defaultImages = [
  { src: galleryFieldTrip1, title: "Educational Trip", category: "Activities", emoji: "🎒" },
  { src: galleryAchievement, title: "Student Achievement", category: "Awards", emoji: "🏆" },
  { src: galleryStudents1, title: "Happy Students", category: "Activities", emoji: "😊" },
  { src: galleryFieldTrip2, title: "Outdoor Learning", category: "Activities", emoji: "🌳" },
  { src: galleryStudents2, title: "Our Bright Stars", category: "Students", emoji: "⭐" },
];

interface GalleryContent {
  title: string;
  titleHighlight: string;
  description: string;
}

interface GalleryImage {
  src: string;
  title: string;
  category: string;
  emoji: string;
}

const Gallery = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  // State for API data
  const [galleryContent, setGalleryContent] = useState<GalleryContent>({
    title: "Campus",
    titleHighlight: "Gallery",
    description: "Explore our colorful facilities and vibrant campus life! 🏫🎉"
  });
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(defaultImages);

  // Fetch gallery data from API
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const res = await fetch(`${API_URL}/landing/content`);
        const data = await res.json();
        
        if (data.success && data.data) {
          // Set gallery content
          if (data.data.content?.gallery) {
            setGalleryContent({
              title: data.data.content.gallery.title || "Campus",
              titleHighlight: data.data.content.gallery.titleHighlight || "Gallery",
              description: data.data.content.gallery.description || "Explore our colorful facilities! 🏫🎉"
            });
          }
          
          // Set gallery images from API
          if (data.data.content?.gallery?.images && data.data.content.gallery.images.length > 0) {
            const apiImages = data.data.content.gallery.images.map((img: any) => ({
              src: img.src.startsWith('http') ? img.src : `http://localhost:5000${img.src}`,
              title: img.title,
              category: img.category,
              emoji: img.emoji
            }));
            setGalleryImages(apiImages);
          }
        }
      } catch (error) {
        console.error("Error fetching gallery data:", error);
      }
    };

    fetchGalleryData();
  }, []);

  const categories = [
    { name: "All", emoji: "🌟" },
    { name: "Activities", emoji: "🎒" },
    { name: "Awards", emoji: "🏆" },
    { name: "Students", emoji: "😊" },
    { name: "Events", emoji: "🎉" },
    { name: "Campus", emoji: "🏫" },
    { name: "Sports", emoji: "⚽" },
  ];

  // Intersection Observer for reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const filteredImages =
    selectedCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  // Auto-slide effect
  useEffect(() => {
    if (filteredImages.length <= 1 || !isAutoPlay || isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % filteredImages.length);
    }, 2500); // 2.5 seconds - faster

    return () => clearInterval(interval);
  }, [filteredImages.length, selectedCategory, isAutoPlay, isHovered]);

  // Reset slide when category changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedCategory]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % filteredImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  // Get index for 3-layer carousel
  const getSlideIndex = (offset: number) => {
    const len = filteredImages.length;
    return (currentSlide + offset + len) % len;
  };

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-background via-tertiary/5 to-quaternary/5 relative overflow-hidden pattern-dots"
    >
      {/* Fun decorative elements */}
      <div className="absolute top-20 left-10 text-7xl animate-float opacity-20">📸</div>
      <div className="absolute bottom-20 right-10 text-6xl animate-wiggle opacity-20">🎨</div>
      <div className="absolute top-1/2 left-20 text-5xl animate-bounce-slow opacity-20">🌈</div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div 
          className={`text-center mb-12 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Camera className="w-10 h-10 text-primary animate-wiggle" />
            <span className="text-5xl animate-bounce-slow">📷</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {galleryContent.title}{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              {galleryContent.titleHighlight}
            </span>
            <span className="inline-block ml-2 animate-wiggle">✨</span>
          </h2>
          <p className="text-lg text-foreground/80 font-medium mb-8">
            {galleryContent.description}
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-5 py-2.5 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 border-2 text-sm md:text-base ${
                  selectedCategory === category.name
                    ? "bg-gradient-hero text-white shadow-glow border-transparent scale-105"
                    : "bg-card hover:bg-muted text-foreground border-border hover:border-primary/30"
                }`}
              >
                <span className="mr-2">{category.emoji}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Layer 3D Carousel */}
        {filteredImages.length > 0 && (
          <div 
            className="relative h-[320px] md:h-[420px] lg:h-[480px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ perspective: '1200px' }}
          >
            {/* Carousel Container */}
            <div className="absolute inset-0 flex items-center justify-center">
              
              {/* Previous Image (Left - Going Away) */}
              {filteredImages.length > 2 && (
                <div
                  className="absolute rounded-2xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-500 ease-out hover:brightness-90"
                  style={{
                    width: 'clamp(180px, 28vw, 380px)',
                    height: 'clamp(130px, 20vw, 280px)',
                    transform: 'translateX(-90%) scale(0.8) rotateY(30deg)',
                    opacity: 0.7,
                    zIndex: 2,
                    filter: 'brightness(0.75)',
                    transformStyle: 'preserve-3d',
                  }}
                  onClick={prevSlide}
                >
                  <img
                    src={filteredImages[getSlideIndex(-1)].src}
                    alt={filteredImages[getSlideIndex(-1)].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <span className="text-xl">{filteredImages[getSlideIndex(-1)].emoji}</span>
                    <span className="text-white text-xs font-medium truncate max-w-[100px]">{filteredImages[getSlideIndex(-1)].title}</span>
                  </div>
                </div>
              )}

              {/* Current Image (Center - Main Focus) */}
              <div
                className="absolute rounded-3xl overflow-hidden transition-all duration-500 ease-out border-4 border-white/40 hover:border-white/60"
                style={{
                  width: 'clamp(260px, 42vw, 580px)',
                  height: 'clamp(180px, 30vw, 380px)',
                  transform: 'translateX(0) scale(1) rotateY(0deg)',
                  opacity: 1,
                  zIndex: 10,
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 30px rgba(99, 102, 241, 0.3)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  src={filteredImages[currentSlide].src}
                  alt={filteredImages[currentSlide].title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl md:text-4xl">{filteredImages[currentSlide].emoji}</span>
                      <span className="inline-block px-3 py-1 bg-gradient-hero text-white text-xs md:text-sm font-bold rounded-full shadow-lg">
                        {filteredImages[currentSlide].category}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-white drop-shadow-lg">
                      {filteredImages[currentSlide].title}
                    </h3>
                  </div>
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Next Image (Right - Coming) */}
              {filteredImages.length > 2 && (
                <div
                  className="absolute rounded-2xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-500 ease-out hover:brightness-90"
                  style={{
                    width: 'clamp(180px, 28vw, 380px)',
                    height: 'clamp(130px, 20vw, 280px)',
                    transform: 'translateX(90%) scale(0.8) rotateY(-30deg)',
                    opacity: 0.7,
                    zIndex: 2,
                    filter: 'brightness(0.75)',
                    transformStyle: 'preserve-3d',
                  }}
                  onClick={nextSlide}
                >
                  <img
                    src={filteredImages[getSlideIndex(1)].src}
                    alt={filteredImages[getSlideIndex(1)].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent" />
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <span className="text-white text-xs font-medium truncate max-w-[100px]">{filteredImages[getSlideIndex(1)].title}</span>
                    <span className="text-xl">{filteredImages[getSlideIndex(1)].emoji}</span>
                  </div>
                </div>
              )}

              {/* Far Left (Ghost - Going away) */}
              {filteredImages.length > 4 && (
                <div
                  className="absolute rounded-xl overflow-hidden transition-all duration-500 ease-out"
                  style={{
                    width: 'clamp(100px, 15vw, 200px)',
                    height: 'clamp(70px, 11vw, 150px)',
                    transform: 'translateX(-160%) scale(0.55) rotateY(45deg)',
                    opacity: 0.35,
                    zIndex: 0,
                    filter: 'brightness(0.5) blur(2px)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={filteredImages[getSlideIndex(-2)].src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Far Right (Ghost - Coming) */}
              {filteredImages.length > 4 && (
                <div
                  className="absolute rounded-xl overflow-hidden transition-all duration-500 ease-out"
                  style={{
                    width: 'clamp(100px, 15vw, 200px)',
                    height: 'clamp(70px, 11vw, 150px)',
                    transform: 'translateX(160%) scale(0.55) rotateY(-45deg)',
                    opacity: 0.35,
                    zIndex: 0,
                    filter: 'brightness(0.5) blur(2px)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={filteredImages[getSlideIndex(2)].src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110 z-20 group active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-800 group-hover:text-primary transition-colors" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-110 z-20 group active:scale-95"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-800 group-hover:text-primary transition-colors" />
                </button>
              </>
            )}

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`absolute bottom-1 right-1 md:bottom-3 md:right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-20 ${isAutoPlay ? 'bg-green-500/90 hover:bg-green-500' : 'bg-red-500/90 hover:bg-red-500'}`}
              title={isAutoPlay ? "Pause" : "Play"}
            >
              {isAutoPlay ? (
                <Pause className="w-4 h-4 text-white" />
              ) : (
                <Play className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>
          </div>
        )}

        {/* Dots Indicator */}
        {filteredImages.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-5">
            {filteredImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-gradient-hero w-8 shadow-glow' 
                    : 'bg-gray-300 hover:bg-primary/50 w-2.5'
                }`}
              />
            ))}
          </div>
        )}

        {/* Thumbnail Strip */}
        {filteredImages.length > 1 && (
          <div className="mt-5 flex gap-2 overflow-x-auto pb-3 justify-center flex-wrap md:flex-nowrap">
            {filteredImages.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={() => setCurrentSlide(index)}
                className={`flex-shrink-0 w-14 h-10 md:w-20 md:h-14 rounded-lg overflow-hidden transition-all duration-300 ${
                  currentSlide === index 
                    ? 'ring-2 ring-primary scale-110 shadow-lg' 
                    : 'opacity-40 hover:opacity-100 hover:scale-105 grayscale hover:grayscale-0'
                }`}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Counter */}
        {filteredImages.length > 0 && (
          <div className="text-center mt-3">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-card/80 backdrop-blur rounded-full shadow border border-border text-sm">
              <span>🖼️</span>
              <span className="font-bold">
                {currentSlide + 1} / {filteredImages.length}
              </span>
            </span>
          </div>
        )}

        {filteredImages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 animate-bounce-slow">😢</div>
            <p className="text-foreground/70 text-xl font-medium">No images found in this category.</p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="mt-4 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-transform"
            >
              View All Images 🌟
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;