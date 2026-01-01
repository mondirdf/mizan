import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Moon, Sun, Plus, Trash2, Clock, AlertCircle, Calendar, Ban, ThumbsDown, Loader2 } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

interface Task {
  id: number;
  name: string;
  hours: number;
  urgency: number;
  deadline: string;
}

type SlotMode = "unavailable" | "preferred";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [slotMode, setSlotMode] = useState<SlotMode>("unavailable");
  const [selectedSlots, setSelectedSlots] = useState<Record<string, SlotMode>>({});
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: "مراجعة الرياضيات", hours: 3, urgency: 4, deadline: "" },
  ]);
  const [newTask, setNewTask] = useState({ name: "", hours: 2, urgency: 3, deadline: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user_id, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.id) {
        setUserId(sessionData.session.user.id);
      }
    };
    getSession();
  }, []);

  // Calculate hours based on sleep/wake times
  const { hours, sleepHours } = useMemo(() => {
    const wakeHour = parseInt(wakeTime.split(":")[0]);
    const sleepHour = parseInt(sleepTime.split(":")[0]);
    
    // Generate all 24 hours
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    
    // Calculate sleep hours
    const sleepHoursSet = new Set<number>();
    if (sleepHour > wakeHour) {
      // Normal case: sleep at 23:00, wake at 07:00
      for (let h = sleepHour; h < 24; h++) sleepHoursSet.add(h);
      for (let h = 0; h < wakeHour; h++) sleepHoursSet.add(h);
    } else {
      // Edge case: sleep at 02:00, wake at 10:00
      for (let h = sleepHour; h < wakeHour; h++) sleepHoursSet.add(h);
    }
    
    // Filter to show only awake hours
    const awakeHours = allHours.filter(h => !sleepHoursSet.has(h));
    
    return { hours: awakeHours, sleepHours: sleepHoursSet };
  }, [sleepTime, wakeTime]);

  const toggleSlot = (day: number, hour: number) => {
    const key = `${day}-${hour}`;
    setSelectedSlots((prev) => {
      const current = prev[key];
      if (current === slotMode) {
        // Remove if clicking same mode
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      // Set to current mode
      return { ...prev, [key]: slotMode };
    });
  };

  const addTask = () => {
    if (newTask.name.trim()) {
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
      setNewTask({ name: "", hours: 2, urgency: 3, deadline: "" });
    }
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const hourOptions = [
    // From 1 to 5: every 0.5 hours
    1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5,
    // From 6 to 50: every 1 hour
    ...Array.from({ length: 45 }, (_, i) => i + 6)
  ];

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-muted-foreground">
                الخطوة {step} من 2
              </h2>
              <div className="flex gap-2">
                {[1, 2].map((s) => (
                  <motion.div
                    key={s}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      s <= step ? "w-12 bg-primary" : "w-8 bg-muted"
                    }`}
                    layout
                  />
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Schedule */}
                <div className="glass-card rounded-3xl p-6 mb-6">
                  <h1 className="text-2xl font-bold mb-2">حدد أوقاتك</h1>
                  <p className="text-muted-foreground mb-6">
                    أخبرنا عن جدولك اليومي لنساعدك في تنظيم وقتك
                  </p>

                  {/* Sleep times */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Moon className="w-4 h-4 text-secondary" />
                        وقت النوم
                      </label>
                      <input
                        type="time"
                        value={sleepTime}
                        onChange={(e) => setSleepTime(e.target.value)}
                        className="input-glass text-center"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Sun className="w-4 h-4 text-primary" />
                        وقت الاستيقاظ
                      </label>
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="input-glass text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Weekly grid */}
                <div className="glass-card rounded-3xl p-4 mb-6 overflow-x-auto">
                  {/* Mode selector */}
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-3">ماذا تريد تحديده؟</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSlotMode("unavailable")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                          slotMode === "unavailable"
                            ? "bg-destructive/20 text-destructive border-2 border-destructive/50"
                            : "bg-muted/50 text-muted-foreground border-2 border-transparent hover:bg-muted"
                        }`}
                      >
                        <Ban className="w-4 h-4" />
                        <span className="font-medium">أوقات غير متاحة</span>
                      </button>
                      <button
                        onClick={() => setSlotMode("preferred")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                          slotMode === "preferred"
                            ? "bg-purple-light text-purple-dark border-2 border-purple-dark/50"
                            : "bg-muted/50 text-muted-foreground border-2 border-transparent hover:bg-muted"
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span className="font-medium">أوقات غير محببة</span>
                      </button>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-destructive/30" /> غير متاح
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-purple-light" /> غير مفضل
                    </span>
                  </div>
                  
                  <div className="min-w-[600px]">
                    <div className="grid grid-cols-8 gap-1">
                      <div className="h-8" />
                      {days.map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                      
                      {hours.map((hour) => (
                        <>
                          <div key={`hour-${hour}`} className="text-xs text-muted-foreground text-left py-1 pl-2">
                            {hour}:00
                          </div>
                          {days.map((_, dayIndex) => {
                            const key = `${dayIndex}-${hour}`;
                            const status = selectedSlots[key];
                            return (
                              <motion.button
                                key={key}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleSlot(dayIndex, hour)}
                                className={`time-slot h-8 ${
                                  status === "unavailable"
                                    ? "time-slot-unavailable"
                                    : status === "preferred"
                                    ? "time-slot-preferred"
                                    : "time-slot-available"
                                }`}
                              />
                            );
                          })}
                        </>
                      ))}
                    </div>
                  </div>

                  {/* Hours info */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center">
                      الجدول يعرض ساعات الاستيقاظ فقط ({hours.length} ساعة) • من {wakeTime} إلى {sleepTime}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 2: Tasks */}
                <div className="glass-card rounded-3xl p-6 mb-6">
                  <h1 className="text-2xl font-bold mb-2">مهام الأسبوع</h1>
                  <p className="text-muted-foreground mb-6">
                    أضف المهام التي تريد إنجازها هذا الأسبوع
                  </p>

                  {/* Add task form */}
                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      placeholder="اسم المهمة"
                      value={newTask.name}
                      onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                      className="input-glass"
                    />
                    
                    {/* Hours selector - Scroll picker */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-3">
                        <Clock className="w-4 h-4 text-primary" />
                        الساعات التقديرية
                      </label>
                      <div className="relative">
                        <div className="flex gap-2 overflow-x-auto pb-3 pt-1 px-1 scrollbar-hide scroll-smooth snap-x snap-mandatory">
                          {hourOptions.map((h) => (
                            <motion.button
                              key={h}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setNewTask({ ...newTask, hours: h })}
                              className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-200 snap-center ${
                                newTask.hours === h
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              <span className="text-base font-bold">{h}</span>
                            </motion.button>
                          ))}
                        </div>
                        {/* Fade edges */}
                        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-l from-transparent to-card pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-r from-transparent to-card pointer-events-none" />
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-2">اسحب لاختيار الساعات</p>
                    </div>

                    {/* Urgency selector - 5 dots */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-3">
                        <AlertCircle className="w-4 h-4 text-secondary" />
                        درجة الاستعجال
                      </label>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-xs text-muted-foreground">منخفض</span>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <motion.button
                              key={level}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setNewTask({ ...newTask, urgency: level })}
                              className="relative"
                            >
                              <motion.div
                                animate={{
                                  scale: newTask.urgency >= level ? 1 : 0.8,
                                  backgroundColor: newTask.urgency >= level 
                                    ? `hsl(${340 - (level - 1) * 15} 70% ${70 - (level - 1) * 8}%)`
                                    : "hsl(var(--muted))"
                                }}
                                className={`w-8 h-8 rounded-full transition-all duration-200 ${
                                  newTask.urgency >= level 
                                    ? "shadow-md" 
                                    : ""
                                }`}
                              />
                              {newTask.urgency === level && (
                                <motion.div
                                  layoutId="urgencyIndicator"
                                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground"
                                />
                              )}
                            </motion.button>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">عالي</span>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        تاريخ التسليم (اختياري)
                      </label>
                      <input
                        type="date"
                        value={newTask.deadline}
                        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                        className="input-glass"
                      />
                    </div>

                    <button
                      onClick={addTask}
                      className="w-full btn-secondary flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      إضافة مهمة
                    </button>
                  </div>

                  {/* Tasks list */}
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{task.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{task.hours} ساعات</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < task.urgency ? "bg-secondary" : "bg-muted"
                                  }`}
                                />
                              ))}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTask(task.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-destructive/10 text-destructive text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
                السابق
              </button>
            )}
            <button
              onClick={async () => {
                onClick={async () => {
  // الانتقال بين الخطوتين
  if (step < 2) {
    setStep(step + 1);
    return;
  }

  // التحقق من تسجيل الدخول
  if (!user_id) {
    setError("يجب تسجيل الدخول أولاً");
    return;
  }

  setLoading(true);
  setError("");

  try {
    await api.generateSchedule(user_id);
    navigate("/dashboard");
  } catch (e) {
    setError("فشل إنشاء الجدول");
  } finally {
    setLoading(false);
  }
}}
              }}
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : step < 2 ? (
                <>
                  التالي
                  <ChevronLeft className="w-5 h-5" />
                </>
              ) : (
                "إنشاء الجدول"
              )}
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Onboarding;
