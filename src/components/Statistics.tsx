import { useEffect, useState } from "react";
import { TrendingUp, Users, Clock, Building2 } from "lucide-react";

interface StatItemProps {
  icon: any;
  value: number;
  suffix?: string;
  label: string;
  gradient: string;
  iconColor: string;
}

const StatItem = ({ icon: Icon, value, suffix = "", label, gradient, iconColor }: StatItemProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`group relative overflow-hidden bg-gradient-to-br ${gradient} p-6 rounded-2xl glass border-2 border-white/20 hover:border-primary/30 transition-all duration-300 hover:scale-105`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl bg-white/50 backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <div className="text-4xl font-bold mb-2">
          {count.toLocaleString()}{suffix}
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          {label}
        </div>
      </div>
    </div>
  );
};

const Statistics = () => {
  const stats = [
    {
      icon: TrendingUp,
      value: 1250,
      suffix: "+",
      label: "SPM Diproses",
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-600",
    },
    {
      icon: Users,
      value: 98,
      suffix: "%",
      label: "Tingkat Approval",
      gradient: "from-green-500/10 to-emerald-500/10",
      iconColor: "text-green-600",
    },
    {
      icon: Clock,
      value: 99,
      suffix: "%",
      label: "Uptime Sistem",
      gradient: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-600",
    },
    {
      icon: Building2,
      value: 50,
      suffix: "+",
      label: "OPD Terhubung",
      gradient: "from-orange-500/10 to-amber-500/10",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <section className="container py-20 relative">
      {/* Background blur elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
      </div>

      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Statistik Sistem
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sistem yang dipercaya dan digunakan oleh puluhan OPD di Kolaka Utara
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {stats.map((stat, index) => (
          <StatItem key={index} {...stat} />
        ))}
      </div>
    </section>
  );
};

export default Statistics;
