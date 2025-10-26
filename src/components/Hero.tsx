import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative container py-24 md:py-32 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" style={{ animationDelay: "4s" }} />
      </div>

      {/* Floating Shapes */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-primary/20 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-16 h-16 border-2 border-accent/20 rounded-lg rotate-45 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-1/4 w-12 h-12 border-2 border-purple-500/20 rounded-full animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="mx-auto max-w-4xl text-center animate-fade-in relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-sm font-medium">Dipercaya oleh 50+ OPD</span>
        </div>

        {/* Hero Heading with Gradient */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
          Sistem Informasi Manajemen
          <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            Pertanggungjawaban Bendahara
          </span>
        </h1>
        
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
          Platform digital untuk memonitor, mendokumentasi, dan memvalidasi proses
          pertanggungjawaban Bendahara di BKAD Kolaka Utara
        </p>

        {/* CTA Buttons with Enhanced Styles */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="font-semibold group hover:shadow-xl hover:shadow-primary/20 transition-all duration-300" asChild>
            <Link to="/dashboard">
              Akses Dashboard
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="font-semibold glass hover:bg-primary/5 transition-all duration-300" asChild>
            <Link to="/tentang">Pelajari Lebih Lanjut</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
