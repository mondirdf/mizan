import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Moon, Sun, Plus, Trash2, Clock, AlertCircle, Calendar } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";

const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

interface Task {
  id: number;
  name: string;
  hours: number;
  urgency: number;
  deadline: string;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [selectedSlots, setSelectedSlots] = useState<Record<string, "unavailable" | "preferred">>({});
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, name: "مراجعة الرياضيات", hours: 3, urgency: 4, deadline: "" },
  ]);
  const [newTask, setNewTask] = useState({ name: "", hours: 1, urgency: 3, deadline: "" });

  const toggleSlot = (day: number, hour: number) => {
    const key = `${day}-${hour}`;
    setSelectedSlots((prev) => {
      const current = prev[key];
      if (!current) return { ...prev, [key]: "unavailable" };
      if (current === "unavailable") return { ...prev, [key]: "preferred" };
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const addTask = () => {
    if (newTask.name.trim()) {
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
      setNewTask({ name: "", hours: 1, urgency: 3, deadline: "" });
    }
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

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
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">اضغط لتحديد:</span>
                    <span className="flex items-center gap-1 text-xs">
                      <span className="w-3 h-3 rounded bg-destructive/30" /> غير متاح
                    </span>
                    <span className="flex items-center gap-1 text-xs">
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                          <Clock className="w-4 h-4 text-primary" />
                          الساعات التقديرية
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={newTask.hours}
                          onChange={(e) => setNewTask({ ...newTask, hours: parseInt(e.target.value) || 1 })}
                          className="input-glass"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                          <AlertCircle className="w-4 h-4 text-secondary" />
                          الاستعجال (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={newTask.urgency}
                          onChange={(e) => setNewTask({ ...newTask, urgency: parseInt(e.target.value) || 1 })}
                          className="input-glass"
                        />
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
                                  className={`w-1.5 h-1.5 rounded-full ${
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

          {/* Navigation buttons */}
          <div className="flex gap-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronRight className="w-5 h-5" />
                السابق
              </button>
            )}
            <button
              onClick={() => {
                if (step < 2) setStep(step + 1);
                else navigate("/dashboard");
              }}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              {step < 2 ? (
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