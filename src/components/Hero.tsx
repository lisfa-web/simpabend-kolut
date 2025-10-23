import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="container py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
          Sistem Informasi Manajemen
          <span className="block text-primary mt-2">
            Pertanggungjawaban Bendahara
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
          Platform digital untuk memonitor, mendokumentasi, dan memvalidasi proses
          pertanggungjawaban Bendahara di BKAD Kolaka Utara
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="font-semibold" asChild>
            <Link to="/dashboard">
              Akses Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="font-semibold" asChild>
            <Link to="/tentang">Pelajari Lebih Lanjut</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
