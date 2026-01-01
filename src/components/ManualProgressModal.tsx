import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface ManualProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  user_id: string;
  tasks: Array<{ id: string; name: string }>;
}

const ManualProgressModal = ({ isOpen, onClose, user_id, tasks }: ManualProgressModalProps) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    task_id: "",
    minutes: 0,
    focus_rating: 0,
    note: ""
  });

  const handleSubmit = async () => {
    if (formData.focus_rating === 0) {
      alert("يجب تقييم التركيز");
      return;
    }

    setSaving(true);
    try {
      await api.logManualProgress({
        user_id,
        task_id: formData.task_id,
        minutes: formData.minutes,
        focus_rating: formData.focus_rating,
        note: formData.note
      });
      navigate("/dashboard");
    } catch (e) {
      alert("فشل حفظ التقدم");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
              <h3 className="text-xl font-bold">إدخال التقدم</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Task select */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">المهمة</label>
              <select
                value={formData.task_id}
                onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
                className="input-glass w-full"
              >
                <option value="">اختر المهمة</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Minutes input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">الدقائق</label>
              <input
                type="number"
                value={formData.minutes}
                onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
                className="input-glass w-full"
                min={0}
              />
            </div>

            {/* Focus rating buttons 1-5 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">تقييم التركيز</label>
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs text-muted-foreground">ضعيف</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <motion.button
                      key={rating}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFormData({ ...formData, focus_rating: rating })}
                      className={`w-10 h-10 rounded-full transition-all duration-200 ${
                        formData.focus_rating >= rating
                          ? "bg-primary shadow-lg shadow-primary/30"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">ممتاز</span>
              </div>
            </div>

            {/* Note textarea */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">ملاحظة (اختياري)</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="ماذا أنجزت؟"
                className="input-glass w-full h-24 resize-none"
              />
            </div>

            {/* Submit button with loading */}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التقدم"
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManualProgressModal;
