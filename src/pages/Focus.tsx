import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, RotateCcw, Coffee, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import BottomNav from "@/components/layout/BottomNav";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const Focus = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [focusRating, setFocusRating] = useState(0);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [actualMinutes, setActualMinutes] = useState(0);
  const [user_id, setUserId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.id) {
        setUserId(sessionData.session.user.id);
      }
    };
    getSession();
  }, []);

  const formatTime = (min: number, sec: number) => {
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const totalSeconds = 25 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSec) => {
          if (prevSec === 0) {
            if (minutes === 0) {
              // Timer finished
              clearInterval(intervalRef.current!);
              setIsRunning(false);
              setActualMinutes(25);
              setShowRatingModal(true);
              return 0;
            }
            setMinutes((prevMin) => prevMin - 1);
            return 59;
          }
          return prevSec - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, minutes]);

  const handleStop = () => {
    const elapsedMinutes = 25 - minutes - (seconds > 0 ? 0 : 1);
    setActualMinutes(Math.max(1, elapsedMinutes));
    setIsRunning(false);
    setIsPaused(false);
    setShowRatingModal(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setMinutes(25);
    setSeconds(0);
  };

  const handleSaveSession = async () => {
    if (!focusRating) {
      return;
    }

    if (!user_id) return;

    setSaving(true);
    try {
      await api.logPomodoro({
        user_id: user_id,
        session_id: `session-${Date.now()}`,
        actual_minutes: actualMinutes,
        focus_rating: focusRating,
        note: note || undefined,
      });
      
      // Reset everything
      setShowRatingModal(false);
      setFocusRating(0);
      setNote("");
      setMinutes(25);
      setSeconds(0);
      navigate("/dashboard");
    } catch (e) {
      alert("فشل حفظ الجلسة");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowRatingModal(false);
    setFocusRating(0);
    setNote("");
    setMinutes(25);
    setSeconds(0);
  };

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
                  onClick={handleReset}
                  className="btn-secondary w-14 h-14 rounded-2xl flex items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStop}
                  className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                >
                  <Square className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-3xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">كيف كان تركيزك؟</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Rating dots */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-xs text-muted-foreground">ضعيف</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <motion.button
                      key={rating}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFocusRating(rating)}
                      className={`w-10 h-10 rounded-full transition-all duration-200 ${
                        focusRating >= rating
                          ? "bg-primary shadow-lg shadow-primary/30"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">ممتاز</span>
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">ملاحظة (اختياري)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="ماذا أنجزت؟ أي ملاحظات؟"
                  className="input-glass w-full h-24 resize-none"
                />
              </div>

              {/* Info */}
              <div className="mb-6 p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">
                  الوقت المنجز: <span className="font-semibold text-foreground">{actualMinutes} دقيقة</span>
                </p>
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveSession}
                disabled={saving || !focusRating}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ الجلسة"
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </PageTransition>
  );
};

export default Focus;