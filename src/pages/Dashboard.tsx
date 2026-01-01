import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, Edit3, Download, Calendar, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import BottomNav from "@/components/layout/BottomNav";
import ManualProgressModal from "@/components/ManualProgressModal";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

// Fallback mock data
const mockSchedule = [
  { day: 0, hour: 9, task: "مراجعة الرياضيات", duration: 2, color: "primary" },
  { day: 0, hour: 14, task: "قراءة الفصل الخامس", duration: 1.5, color: "secondary" },
  { day: 1, hour: 10, task: "حل تمارين الفيزياء", duration: 2, color: "primary" },
  { day: 1, hour: 15, task: "مراجعة الكيمياء", duration: 1, color: "secondary" },
  { day: 2, hour: 8, task: "مشروع البرمجة", duration: 3, color: "primary" },
  { day: 3, hour: 11, task: "مراجعة الرياضيات", duration: 2, color: "secondary" },
  { day: 4, hour: 9, task: "قراءة الفصل السادس", duration: 1.5, color: "primary" },
  { day: 5, hour: 10, task: "تحضير العرض", duration: 2, color: "secondary" },
];

const mockTasks = [
  { id: "task-1", name: "مراجعة الرياضيات" },
  { id: "task-2", name: "قراءة الفصل الخامس" },
  { id: "task-3", name: "حل تمارين الفيزياء" },
];

interface DashboardData {
  today_sessions: Array<{ task: string; hour: number; duration: number }>;
  today_progress: {
    total_minutes: number;
    avg_focus: number;
  };
  schedule: typeof mockSchedule;
}

// للاختبار فقط: user_id ثابت
const TEST_USER_ID = "test-user-0001";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [user_id, setUserId] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.id) {
        setUserId(sessionData.session.user.id);
      } else {
        // للاختبار فقط: استخدم user_id ثابت
        setUserId(TEST_USER_ID);
      }
    };
    getSession();
  }, []);

  const fetchDashboard = async () => {
    if (!user_id) return;
    
    setLoading(true);
    setError("");
    try {
      const today = new Date().toISOString().split("T")[0];
      const result = await api.getDashboard(user_id, today);
      setData(result);
    } catch (e) {
      setError("فشل تحميل البيانات");
      // Use mock data as fallback
      setData({
        today_sessions: mockSchedule.filter(s => s.day === 0),
        today_progress: { total_minutes: 120, avg_focus: 4.2 },
        schedule: mockSchedule,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user_id) {
      fetchDashboard();
    }
  }, [user_id]);

  const schedule = data?.schedule || mockSchedule;
  const todayTasks = data?.today_sessions || mockSchedule.filter(s => s.day === 0);
  const progress = data?.today_progress || { total_minutes: 0, avg_focus: 0 };

  return (
    <PageTransition>
      <div className="min-h-screen px-4 pt-6 pb-28">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">مرحباً بك 👋</h1>
                <p className="text-muted-foreground">هذا جدولك للأسبوع القادم</p>
              </div>
              <button
                onClick={fetchDashboard}
                disabled={loading}
                className="p-2 rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </motion.div>

          {/* Loading state */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">جاري التحميل...</p>
            </motion.div>
          )}

          {/* Error state */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Content */}
          {!loading && (
            <>
              {/* Stats cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-2 gap-3 mb-6"
              >
                <div className="glass-card rounded-2xl p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{progress.total_minutes}</p>
                  <p className="text-sm text-muted-foreground">دقيقة منجزة</p>
                </div>
                <div className="glass-card rounded-2xl p-4 text-center">
                  <p className="text-3xl font-bold text-secondary">{progress.avg_focus.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">متوسط التركيز</p>
                </div>
              </motion.div>

              {/* Quick actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3 mb-6"
              >
                <button
                  onClick={() => navigate("/focus")}
                  className="glass-card rounded-2xl p-4 text-center hover:scale-[1.02] transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Timer className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">جلسة تركيز</span>
                </button>
                <button
                  onClick={() => setShowManualModal(true)}
                  className="glass-card rounded-2xl p-4 text-center hover:scale-[1.02] transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                    <Edit3 className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-sm font-medium">إدخال التقدم</span>
                </button>
                <button className="glass-card rounded-2xl p-4 text-center hover:scale-[1.02] transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
                    <Download className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">تحميل PDF</span>
                </button>
              </motion.div>

              {/* Today's tasks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-3xl p-5 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    مهام اليوم
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>

                <div className="space-y-3">
                  {todayTasks.length > 0 ? (
                    todayTasks.map((item: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl ${
                          item.color === "primary" ? "bg-primary/5" : "bg-secondary/5"
                        }`}
                      >
                        <div
                          className={`w-1 h-12 rounded-full ${
                            item.color === "primary" ? "bg-primary" : "bg-secondary"
                          }`}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.task}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.hour}:00 - {item.hour + item.duration}:00 ({item.duration} ساعات)
                          </p>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">لا توجد مهام لليوم</p>
                  )}
                </div>
              </motion.div>

              {/* Weekly schedule */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-3xl p-5"
              >
                <h2 className="text-lg font-semibold mb-4">الجدول الأسبوعي</h2>
                
                <div className="overflow-x-auto -mx-2 px-2">
                  <div className="min-w-[700px] grid grid-cols-7 gap-2">
                    {days.map((day, dayIndex) => (
                      <div key={day} className="space-y-2">
                        <div className="text-center py-2">
                          <span className={`text-sm font-medium ${
                            dayIndex === new Date().getDay() ? "text-primary" : "text-muted-foreground"
                          }`}>
                            {day}
                          </span>
                        </div>
                        
                        <div className="space-y-1.5 min-h-[200px]">
                          {schedule
                            .filter((s: any) => s.day === dayIndex)
                            .map((item: any, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                className={`p-2 rounded-lg text-xs ${
                                  item.color === "primary"
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "bg-secondary/10 text-secondary border border-secondary/20"
                                }`}
                              >
                                <div className="font-medium truncate">{item.task}</div>
                                <div className="opacity-70 mt-0.5">{item.hour}:00</div>
                              </motion.div>
                            ))}
                          
                          {schedule.filter((s: any) => s.day === dayIndex).length === 0 && (
                            <div className="h-full flex items-center justify-center">
                              <span className="text-xs text-muted-foreground/50">—</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
      <BottomNav />
      
      {/* Manual Progress Modal */}
      {user_id && (
        <ManualProgressModal
          isOpen={showManualModal}
          onClose={() => setShowManualModal(false)}
          user_id={user_id}
          tasks={mockTasks}
        />
      )}
    </PageTransition>
  );
};

export default Dashboard;