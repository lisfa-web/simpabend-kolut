import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
const Hero = () => {
  return <section className="relative container py-24 md:py-32">
      {/* Simple gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20">
          <span className="inline-flex rounded-full h-2 w-2 bg-primary" />
          <span className="text-sm font-medium">SIMPA BEND KAB. KOLAKA UTARA</span>
        </div>

        {/* Hero Heading with Gradient */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
          Sistem Informasi Manajemen
          <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Pertanggungjawaban Bendahara
          </span>
        </h1>
        
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">Platform digital sebagai Administrasi Pendamping SP2D yang diterbitkan oleh SIPD untuk untuk memonitor, pengawasan, mengontrol, mendokumentasi, dan memvalidasi proses SPM SP2D pertanggungjawaban Bendahara serta mengarsipkan seluruh proses SPM SP2D.</p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="font-semibold group" asChild>
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
    </section>;
};
export default Hero;