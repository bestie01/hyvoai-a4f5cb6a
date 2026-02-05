 import { cn } from "@/lib/utils";
 
 interface SkeletonProps {
   className?: string;
 }
 
 export function StatCardSkeleton({ className }: SkeletonProps) {
   return (
     <div
       className={cn(
         "liquid-glass-panel p-6 rounded-2xl overflow-hidden relative",
         className
       )}
     >
       <div className="flex items-center justify-between">
         <div className="space-y-3">
           {/* Title skeleton */}
           <div className="h-4 w-20 bg-white/10 rounded-md relative overflow-hidden animate-pulse">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
           </div>
           {/* Value skeleton */}
           <div className="h-8 w-24 bg-white/10 rounded-md relative overflow-hidden animate-pulse">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
           </div>
         </div>
         {/* Icon skeleton */}
         <div className="w-12 h-12 bg-white/10 rounded-xl relative overflow-hidden animate-pulse">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
         </div>
       </div>
     </div>
   );
 }
 
 export function ChartSkeleton({ className }: SkeletonProps) {
   return (
     <div
       className={cn(
         "liquid-glass-panel p-6 rounded-2xl overflow-hidden relative",
         className
       )}
     >
       {/* Header skeleton */}
       <div className="space-y-2 mb-6">
         <div className="h-6 w-40 bg-white/10 rounded-md relative overflow-hidden animate-pulse">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
         </div>
         <div className="h-4 w-64 bg-white/10 rounded-md relative overflow-hidden animate-pulse">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
         </div>
       </div>
       {/* Chart area skeleton */}
       <div className="h-[300px] bg-white/5 rounded-xl relative overflow-hidden flex items-end justify-around px-4 pb-4">
         {/* Fake bar chart */}
         {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
           <div
             key={i}
             className="w-8 bg-white/10 rounded-t-md relative overflow-hidden animate-pulse"
             style={{ height: `${height}%` }}
           >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
           </div>
         ))}
       </div>
     </div>
   );
 }
 
 export function FeatureCardSkeleton({ className }: SkeletonProps) {
   return (
     <div
       className={cn(
         "liquid-glass-elevated p-6 rounded-2xl overflow-hidden relative",
         className
       )}
     >
       {/* Header with icon */}
       <div className="flex items-center gap-2 mb-4">
         <div className="w-5 h-5 bg-white/10 rounded relative overflow-hidden animate-pulse">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
         </div>
         <div className="h-5 w-28 bg-white/10 rounded-md relative overflow-hidden animate-pulse">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
         </div>
       </div>
       {/* Items skeleton */}
       <div className="space-y-3">
         {[1, 2, 3].map((i) => (
           <div key={i} className="flex items-center justify-between">
             <div className="h-4 w-24 bg-white/10 rounded-md relative overflow-hidden animate-pulse">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
             </div>
             <div className="h-6 w-14 bg-white/10 rounded-full relative overflow-hidden animate-pulse">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
             </div>
           </div>
         ))}
       </div>
     </div>
   );
 }
 
 export function ScheduleSkeleton({ className }: SkeletonProps) {
   return (
     <div
       className={cn(
         "liquid-glass-panel p-6 rounded-2xl overflow-hidden relative",
         className
       )}
     >
       {/* Header */}
       <div className="flex items-center gap-2 mb-4">
         <div className="w-5 h-5 bg-white/10 rounded relative overflow-hidden animate-pulse">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
         </div>
         <div className="h-5 w-36 bg-white/10 rounded-md relative overflow-hidden animate-pulse">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
         </div>
       </div>
       {/* Schedule items */}
       <div className="space-y-3">
         {[1, 2, 3].map((i) => (
           <div key={i} className="flex items-center justify-between p-3 liquid-glass-panel rounded-xl">
             <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-white/10 rounded-full animate-pulse" />
               <div className="h-4 w-40 bg-white/10 rounded-md relative overflow-hidden animate-pulse">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
               </div>
             </div>
             <div className="h-6 w-20 bg-white/10 rounded-full relative overflow-hidden animate-pulse">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
             </div>
           </div>
         ))}
       </div>
     </div>
   );
 }
 
 export function DashboardSkeletonGrid() {
   return (
     <div className="space-y-8">
       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[1, 2, 3, 4].map((i) => (
           <StatCardSkeleton key={i} />
         ))}
       </div>
       
       {/* AI Features Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[1, 2, 3].map((i) => (
           <FeatureCardSkeleton key={i} />
         ))}
       </div>
       
       {/* Chart */}
       <ChartSkeleton />
       
       {/* Schedule */}
       <ScheduleSkeleton />
     </div>
   );
 }