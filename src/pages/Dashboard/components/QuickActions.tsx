import { Button } from "@/components/ui/button";
import { Plus, FileBarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
export const QuickActions = () => {
  const navigate = useNavigate();
  return <div className="flex items-center gap-3">
      <Button onClick={() => navigate("/input-spm")} size="default" className="glass hover:scale-105 transition-all shadow-lg text-red-600 bg-sky-500 hover:bg-sky-400 rounded-sm">
        <Plus className="h-4 w-4 mr-2" />
        Buat SPM Baru
      </Button>
      <Button onClick={() => navigate("/laporan")} variant="outline" className="hover:scale-105 transition-all" size="default">
        <FileBarChart className="h-4 w-4 mr-2" />
        Lihat Laporan
      </Button>
    </div>;
};