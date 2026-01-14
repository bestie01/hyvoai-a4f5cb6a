import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  username: string;
  avatar: string;
  platform: "twitch" | "youtube" | "kick" | "facebook";
  quote: string;
  rating: number;
  followers: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Alex Rivers",
    username: "@alexrivers_live",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    platform: "twitch",
    quote: "Hyvo transformed my streaming workflow. Multi-platform streaming with one click? Game changer. My viewer count doubled in just 2 months!",
    rating: 5,
    followers: "125K"
  },
  {
    id: 2,
    name: "Sarah Chen",
    username: "@sarahplays",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    platform: "youtube",
    quote: "The AI features are incredible. Auto-captions, smart highlights, thumbnail generation - it's like having a production team built into the software.",
    rating: 5,
    followers: "890K"
  },
  {
    id: 3,
    name: "Marcus Johnson",
    username: "@marcusjgaming",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    platform: "twitch",
    quote: "Best streaming software I've ever used. The liquid glass UI is beautiful, and the real-time analytics help me understand my audience better.",
    rating: 5,
    followers: "67K"
  },
  {
    id: 4,
    name: "Emma Wilson",
    username: "@emmawilson_irl",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    platform: "kick",
    quote: "Switched from OBS and never looked back. The scene management and hotkey system are so intuitive. Plus the chat moderation AI is a lifesaver!",
    rating: 5,
    followers: "45K"
  },
  {
    id: 5,
    name: "David Park",
    username: "@davidpark_streams",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    platform: "youtube",
    quote: "The scheduling and analytics features helped me grow from 1K to 50K subscribers in 6 months. Worth every penny of the Pro subscription.",
    rating: 5,
    followers: "52K"
  }
];

const platformColors = {
  twitch: "text-purple-500",
  youtube: "text-red-500",
  kick: "text-green-500",
  facebook: "text-blue-500"
};

const platformNames = {
  twitch: "Twitch",
  youtube: "YouTube",
  kick: "Kick",
  facebook: "Facebook Gaming"
};

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const currentTestimonial = testimonials[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9
    })
  };

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Card */}
      <div className="relative overflow-hidden rounded-2xl glass-strong border border-primary/10 p-8 md:p-12">
        {/* Quote Icon */}
        <Quote className="absolute top-6 left-6 w-12 h-12 text-primary/20" />
        
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="relative z-10"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-6 justify-center">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Star 
                    className={cn(
                      "w-5 h-5",
                      i < currentTestimonial.rating 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-muted-foreground"
                    )} 
                  />
                </motion.div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-xl md:text-2xl text-center text-foreground/90 mb-8 leading-relaxed font-medium">
              "{currentTestimonial.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-primary/30">
                <AvatarImage src={currentTestimonial.avatar} alt={currentTestimonial.name} />
                <AvatarFallback>{currentTestimonial.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-semibold text-foreground">{currentTestimonial.name}</p>
                <p className="text-sm text-muted-foreground">{currentTestimonial.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-xs font-medium", platformColors[currentTestimonial.platform])}>
                    {platformNames[currentTestimonial.platform]}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{currentTestimonial.followers} followers</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
          onClick={prevSlide}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
          onClick={nextSlide}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "bg-primary w-6" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default TestimonialCarousel;
