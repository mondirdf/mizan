import { useState } from "react";
import { motion } from "framer-motion";
import { Timer, Edit3, Download, Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import BottomNav from "@/components/layout/BottomNav";


const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResponse(null);
    try {
      const response = await fetch("https://voqhuievpxdygxpdijxp.supabase.co/functions/v1/generate-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sb_publishable_QOSMRph_L548IQd1nO9PMg_UQz15UDK",
        },
        body: JSON.stringify({ test: true }),
      });
      const data = await response.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResponse(JSON.stringify({ error: String(error) }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };
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
            <h1 className="text-2xl font-bold mb-1">مرحباً بك 👋</h1>
            <p className="text-muted-foreground">هذا جدولك للأسبوع القادم</p>
          </motion.div>

          {/* Quick actions */}
          {/* Test Connection Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-4"
          >
            <button
              onClick={handleTestConnection}
              disabled={isLoading}
              className="w-full glass-card rounded-2xl p-4 text-center hover:scale-[1.01] transition-transform border-2 border-dashed border-primary/30 bg-primary/5"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <span className="font-medium text-primary">اختبار الاتصال</span>
              )}
            </button>
            
            {testResponse && (
              <div className="mt-3 p-4 rounded-xl bg-muted/50 overflow-x-auto">
                <pre className="text-xs text-right whitespace-pre-wrap font-mono" dir="ltr">
                  {testResponse}
                </pre>
              </div>
            )}
          </motion.div>

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
            <button className="glass-card rounded-2xl p-4 text-center hover:scale-[1.02] transition-transform">
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
              <span className="text-sm text-muted-foreground">السبت، 4 يناير</span>
            </div>

            <div className="space-y-3">
              {mockSchedule
                .filter((s) => s.day === 0)
                .map((item, index) => (
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
                ))}
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
                        dayIndex === 0 ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {day}
                      </span>
                    </div>
                    
                    <div className="space-y-1.5 min-h-[200px]">
                      {mockSchedule
                        .filter((s) => s.day === dayIndex)
                        .map((item, index) => (
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
                      
                      {mockSchedule.filter((s) => s.day === dayIndex).length === 0 && (
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
        </div>
      </div>
      <BottomNav />
    </PageTransition>
  );
};

export default Dashboard;