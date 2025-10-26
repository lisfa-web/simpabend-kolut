import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold leading-tight">SIMPA BEND BKADKU</div>
          </div>
          <Button asChild>
            <Link to="/login">Masuk Sistem</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
            Sistem Informasi Manajemen
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Pertanggungjawaban Bendahara
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-gray-600 mb-10">
            Platform digital untuk memonitor, mendokumentasi, dan memvalidasi proses
            pertanggungjawaban Bendahara di BKAD Kolaka Utara
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/dashboard">
                Akses Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/tentang">Pelajari Lebih Lanjut</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
