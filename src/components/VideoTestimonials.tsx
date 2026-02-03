import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Star, Quote, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoTestimonial {
  id: string;
  name: string;
  role: string;
  platform: "twitch" | "youtube" | "kick";
  avatar: string;
  videoThumbnail: string;
  videoPoster: string;
  quote: string;
  rating: number;
  followers: string;
  streamHours: string;
  voiceId: string;
}

const testimonials: VideoTestimonial[] = [
  {
    id: "1",
    name: "Alex Gaming",
    role: "Professional Streamer",
    platform: "twitch",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    videoThumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop",
    videoPoster: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&h=720&fit=crop",
    quote: "Hyvo transformed how I manage my streams. The AI features alone saved me hours every week!",
    rating: 5,
    followers: "125K",
    streamHours: "2,400+",
    voiceId: "TX3LPaxmHKxFdv7VOQHJ", // Liam - energetic male
  },
  {
    id: "2",
    name: "Sarah Creates",
    role: "Content Creator",
    platform: "youtube",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    videoThumbnail: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=640&h=360&fit=crop",
    videoPoster: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1280&h=720&fit=crop",
    quote: "The multi-platform streaming is a game changer. I reach 3x more viewers now!",
    rating: 5,
    followers: "89K",
    streamHours: "1,850+",
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah - warm female
  },
  {
    id: "3",
    name: "Mike Esports",
    role: "Esports Commentator",
    platform: "twitch",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    videoThumbnail: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=640&h=360&fit=crop",
    videoPoster: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=1280&h=720&fit=crop",
    quote: "Professional quality streaming without the complexity. Hyvo just works!",
    rating: 5,
    followers: "210K",
    streamHours: "3,200+",
    voiceId: "nPczCjzI2devNBz1zQrb", // Brian - professional male
  },
  {
    id: "4",
    name: "Luna Vibes",
    role: "Music Streamer",
    platform: "kick",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    videoThumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=360&fit=crop",
    videoPoster: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1280&h=720&fit=crop",
    quote: "The audio mixer is incredible for music streams. Crystal clear quality every time.",
    rating: 5,
    followers: "67K",
    streamHours: "980+",
    voiceId: "pFZP5JQG7iQjIQuC4Bku", // Lily - soft female
  },
];

const platformColors = {
  twitch: "bg-purple-500",
  youtube: "bg-red-500",
  kick: "bg-green-500",
};

export function VideoTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const activeTestimonial = testimonials[activeIndex];

  const playTestimonialAudio = useCallback(async () => {
    const testimonial = testimonials[activeIndex];
    
    setIsLoading(true);
    
    try {
      const response = await fetch(
        "https://fxvvcyjwgxxxezqzucwm.supabase.co/functions/v1/elevenlabs-tts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dnZjeWp3Z3h4eGV6cXp1Y3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzExNzEsImV4cCI6MjA3MTEwNzE3MX0.Lv6PT9SfKcNWHmnFHi3Nr7RiPVwe-vurSN3u-82yCg8",
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dnZjeWp3Z3h4eGV6cXp1Y3dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzExNzEsImV4cCI6MjA3MTEwNzE3MX0.Lv6PT9SfKcNWHmnFHi3Nr7RiPVwe-vurSN3u-82yCg8",
          },
          body: JSON.stringify({ 
            text: testimonial.quote, 
            voiceId: testimonial.voiceId 
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      
      // Clean up previous audio URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      audioUrlRef.current = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrlRef.current);
      audioRef.current.muted = isMuted;
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing testimonial audio:", error);
      toast.error("Failed to generate audio. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [activeIndex, isMuted]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playTestimonialAudio();
    }
  }, [isPlaying, playTestimonialAudio]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      if (audioRef.current) {
        audioRef.current.muted = !prev;
      }
      return !prev;
    });
  }, []);

  const nextTestimonial = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setIsPlaying(false);
  };

  const prevTestimonial = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsPlaying(false);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            Creator Stories
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Hear From Our <span className="text-primary">Streamers</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch how content creators are growing their audiences with Hyvo
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-2xl">
              <AspectRatio ratio={16 / 9}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={activeTestimonial.videoPoster}
                      alt={`${activeTestimonial.name} testimonial`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Play Overlay */}
                    {!isPlaying && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center"
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={togglePlayPause}
                          disabled={isLoading}
                          className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glow-primary disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                          ) : (
                            <Play className="w-8 h-8 text-primary-foreground ml-1" />
                          )}
                        </motion.button>
                      </motion.div>
                    )}

                    {/* Playing State Overlay */}
                    {isPlaying && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/20"
                      >
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-black/50 hover:bg-black/70 text-white"
                            onClick={togglePlayPause}
                          >
                            <Pause className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-black/50 hover:bg-black/70 text-white"
                            onClick={toggleMute}
                          >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </AspectRatio>

              {/* Platform Badge */}
              <div className="absolute top-4 left-4">
                <Badge className={cn(platformColors[activeTestimonial.platform], "text-white capitalize")}>
                  {activeTestimonial.platform}
                </Badge>
              </div>
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={nextTestimonial}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>

          {/* Testimonial Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Quote */}
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-10 h-10 text-primary/20" />
                  <p className="text-2xl md:text-3xl font-medium leading-relaxed pl-8">
                    "{activeTestimonial.quote}"
                  </p>
                </div>

                {/* Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-5 h-5",
                        i < activeTestimonial.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={activeTestimonial.avatar}
                    alt={activeTestimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  />
                  <div>
                    <h4 className="text-xl font-semibold">{activeTestimonial.name}</h4>
                    <p className="text-muted-foreground">{activeTestimonial.role}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">{activeTestimonial.followers}</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">{activeTestimonial.streamHours}</p>
                    <p className="text-sm text-muted-foreground">Stream Hours</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Thumbnail Navigation */}
            <div className="flex gap-3 pt-6">
              {testimonials.map((testimonial, index) => (
                <motion.button
                  key={testimonial.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveIndex(index);
                    setIsPlaying(false);
                  }}
                  className={cn(
                    "relative w-20 h-12 rounded-lg overflow-hidden border-2 transition-all",
                    index === activeIndex
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img
                    src={testimonial.videoThumbnail}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                  {index === activeIndex && (
                    <motion.div
                      layoutId="activeThumbnail"
                      className="absolute inset-0 border-2 border-primary rounded-lg"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
