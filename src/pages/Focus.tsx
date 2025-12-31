import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Square, RotateCcw, Coffee } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import BottomNav from "@/components/layout/BottomNav";

const Focus = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);

  const formatTime = (min: number, sec: number) => {
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

  return (
    <PageTransition>
      <div className="min-h-screen px-4 pt-12 pb-28 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold mb-2">جلسة التركيز</h1>
            <p className="text-muted-foreground">ركز على مهمتك بدون تشتت</p>
          </motion.div>

          {/* Current task */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 mb-8 text-center"
          >
            <span className="text-sm text-muted-foreground">المهمة الحالية</span>
            <h3 className="text-lg font-semibold mt-1">مراجعة الرياضيات</h3>
          </motion.div>

          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="relative">
              {/* Progress ring */}
              <svg className="w-72 h-72 -rotate-90 transform">
                <circle
                  cx="144"
                  cy="144"
                  r="130"
                  className="fill-none stroke-muted stroke-[8]"
                />
                <motion.circle
                  cx="144"
                  cy="144"
                  r="130"
                  className="fill-none stroke-primary stroke-[8]"
                  strokeLinecap="round"
                  strokeDasharray={816}
                  initial={{ strokeDashoffset: 816 }}
                  animate={{ strokeDashoffset: 816 - (816 * progress) / 100 }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              
              {/* Timer display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  key={`${minutes}:${seconds}`}
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-light tracking-wider"
                >
                  {formatTime(minutes, seconds)}
                </motion.span>
                <span className="text-sm text-muted-foreground mt-2">
                  {isRunning ? (isPaused ? "متوقف مؤقتاً" : "جارٍ العمل...") : "جاهز للبدء"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Session info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-6 mb-8"
          >
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-1">
                <span className="text-primary font-semibold">4</span>
              </div>
              <span className="text-xs text-muted-foreground">جلسات اليوم</span>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-1">
                <Coffee className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-xs text-muted-foreground">استراحة بعد قليل</span>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            {!isRunning ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRunning(true)}
                className="btn-primary w-40 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                ابدأ
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPaused(!isPaused)}
                  className="btn-secondary w-14 h-14 rounded-2xl flex items-center justify-center"
                >
                  {isPaused ? (
                    <Play className="w-6 h-6" />
                  ) : (
                    <Pause className="w-6 h-6" />
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsRunning(false);
                    setIsPaused(false);
                    setMinutes(25);
                    setSeconds(0);
                  }}
                  className="btn-secondary w-14 h-14 rounded-2xl flex items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsRunning(false);
                    setIsPaused(false);
                    setMinutes(25);
                    setSeconds(0);
                  }}
                  className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                >
                  <Square className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </div>
      <BottomNav />
    </PageTransition>
  );
};

export default Focus;