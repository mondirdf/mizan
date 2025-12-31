import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Timer, BookOpen, LogOut } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "الجدول", icon: LayoutDashboard },
  { path: "/focus", label: "التركيز", icon: Timer },
  { path: "/reflect", label: "المراجعة", icon: BookOpen },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
    >
      <div className="glass-card-strong rounded-2xl p-2 max-w-md mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-item ${isActive ? "nav-item-active" : "nav-item-inactive"}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-8 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
          <button
            onClick={() => navigate("/login")}
            className="nav-item nav-item-inactive"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">خروج</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default BottomNav;