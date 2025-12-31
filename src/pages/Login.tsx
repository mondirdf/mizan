import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Chrome, Mail, Sparkles } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";

const Login = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background decorations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"
        />

        <div className="relative z-10 text-center max-w-md w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl glass-card-strong mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold gradient-text mb-4">ميزان</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              نظّم وقتك، وازن حياتك
              <br />
              <span className="text-sm">مخطط دراسي ذكي يساعدك على تحقيق أهدافك</span>
            </p>
          </motion.div>

          {/* Login buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <button
              onClick={() => navigate("/onboarding")}
              className="w-full btn-secondary flex items-center justify-center gap-3"
            >
              <Chrome className="w-5 h-5" />
              <span>المتابعة باستخدام Google</span>
            </button>

            <button
              onClick={() => navigate("/onboarding")}
              className="w-full btn-secondary flex items-center justify-center gap-3"
            >
              <Mail className="w-5 h-5" />
              <span>المتابعة بالبريد الإلكتروني</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-sm text-muted-foreground">أو</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/onboarding")}
              className="w-full btn-primary"
            >
              ابدأ كضيف
            </button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-sm text-muted-foreground"
          >
            بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;