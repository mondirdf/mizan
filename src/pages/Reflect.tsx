import { motion } from "framer-motion";
import { TrendingUp, Target, Brain, Star, MessageCircle } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import BottomNav from "@/components/layout/BottomNav";

const stats = [
  { label: "المخطط", value: 12, unit: "ساعة" },
  { label: "المنجز", value: 9.5, unit: "ساعة" },
  { label: "نسبة الإنجاز", value: 79, unit: "%" },
];

const focusRatings = [
  { day: "السبت", rating: 4 },
  { day: "الأحد", rating: 3 },
  { day: "الاثنين", rating: 5 },
  { day: "الثلاثاء", rating: 4 },
  { day: "الأربعاء", rating: 2 },
  { day: "الخميس", rating: 4 },
  { day: "الجمعة", rating: 3 },
];

const Reflect = () => {
  return (
    <PageTransition>
      <div className="min-h-screen px-4 pt-6 pb-28">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold mb-1">المراجعة الأسبوعية</h1>
            <p className="text-muted-foreground">نظرة على إنجازاتك هذا الأسبوع</p>
          </motion.div>

          {/* Stats cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="glass-card rounded-2xl p-4 text-center"
              >
                <div className="text-2xl font-bold gradient-text">
                  {stat.value}
                  <span className="text-sm mr-1">{stat.unit}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Progress comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">المخطط مقابل المنجز</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>المخطط</span>
                  <span className="text-muted-foreground">12 ساعة</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-full rounded-full bg-muted-foreground/30"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>المنجز</span>
                  <span className="text-primary font-medium">9.5 ساعة</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "79%" }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Focus ratings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-3xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-semibold">مستوى التركيز</h2>
            </div>

            <div className="flex justify-between items-end gap-2">
              {focusRatings.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex-1 text-center"
                >
                  <div className="flex flex-col items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.05 + i * 0.02 }}
                        className={`w-full h-4 rounded-md ${
                          i < day.rating
                            ? day.rating >= 4
                              ? "bg-primary"
                              : day.rating >= 3
                              ? "bg-secondary"
                              : "bg-destructive/50"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{day.day}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Notes section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-3xl p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">ملاحظاتك</h2>
            </div>

            <textarea
              placeholder="اكتب ملاحظاتك عن الأسبوع..."
              className="w-full h-24 input-glass resize-none"
            />
          </motion.div>

          {/* Motivational message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card-strong rounded-3xl p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4"
            >
              <Star className="w-7 h-7 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold mb-2">أسبوع جيد!</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              حققت 79% من أهدافك هذا الأسبوع. التقدم الثابت أفضل من الكمال. 
              استمر في العمل بنفس الإيقاع وستصل إلى أهدافك.
            </p>
          </motion.div>
        </div>
      </div>
      <BottomNav />
    </PageTransition>
  );
};

export default Reflect;