import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Platform {
  name: string;
  logo: React.ReactNode;
  color: string;
  bgColor: string;
}

const TwitchLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
  </svg>
);

const YouTubeLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const KickLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M1.333 0v24h5.334v-8l2.666 2.667L14.667 24H22l-8-8.667L20.667 8h-7.334L10.667 10.667V0z"/>
  </svg>
);

const FacebookGamingLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const DiscordLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const TikTokLogo = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const platforms: Platform[] = [
  { name: "Twitch", logo: <TwitchLogo />, color: "text-purple-500", bgColor: "hover:bg-purple-500/10" },
  { name: "YouTube", logo: <YouTubeLogo />, color: "text-red-500", bgColor: "hover:bg-red-500/10" },
  { name: "Kick", logo: <KickLogo />, color: "text-green-500", bgColor: "hover:bg-green-500/10" },
  { name: "Facebook Gaming", logo: <FacebookGamingLogo />, color: "text-blue-500", bgColor: "hover:bg-blue-500/10" },
  { name: "Discord", logo: <DiscordLogo />, color: "text-indigo-400", bgColor: "hover:bg-indigo-500/10" },
  { name: "TikTok", logo: <TikTokLogo />, color: "text-foreground", bgColor: "hover:bg-foreground/10" },
];

// Duplicate for infinite scroll effect
const allPlatforms = [...platforms, ...platforms];

export function PlatformLogos() {
  return (
    <div className="w-full py-12">
      <div className="text-center mb-8">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Trusted by streamers on
        </p>
        <p className="text-lg text-foreground/80">
          Stream to <span className="text-primary font-semibold">all major platforms</span> simultaneously
        </p>
      </div>

      {/* Infinite scroll container */}
      <div className="relative overflow-hidden">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        
        <motion.div 
          className="flex gap-8"
          animate={{ x: [0, -50 * platforms.length] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
        >
          {allPlatforms.map((platform, index) => (
            <motion.div
              key={`${platform.name}-${index}`}
              className={cn(
                "flex flex-col items-center justify-center gap-2 min-w-[120px] p-4 rounded-xl transition-all duration-300 cursor-pointer",
                "text-muted-foreground",
                platform.bgColor
              )}
              whileHover={{ 
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
            >
              <div className={cn("transition-colors duration-300", platform.color)}>
                {platform.logo}
              </div>
              <span className="text-xs font-medium whitespace-nowrap">{platform.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Stats below logos */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-3xl font-bold text-gradient-primary">50K+</p>
          <p className="text-sm text-muted-foreground">Active Streamers</p>
        </motion.div>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-3xl font-bold text-gradient-primary">2M+</p>
          <p className="text-sm text-muted-foreground">Hours Streamed</p>
        </motion.div>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-3xl font-bold text-gradient-primary">4.9/5</p>
          <p className="text-sm text-muted-foreground">Average Rating</p>
        </motion.div>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-3xl font-bold text-gradient-primary">99.9%</p>
          <p className="text-sm text-muted-foreground">Uptime</p>
        </motion.div>
      </div>
    </div>
  );
}

export default PlatformLogos;
