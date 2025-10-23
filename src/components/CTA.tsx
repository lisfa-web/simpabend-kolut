import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="container py-20">
      <div className="mx-auto max-w-3xl rounded-2xl bg-primary px-8 py-16 text-center shadow-xl">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-4">
          Siap Meningkatkan Transparansi dan Efisiensi?
        </h2>
        <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          Bergabunglah dengan sistem digital yang modern dan terpercaya untuk manajemen keuangan daerah
        </p>
        <Button size="lg" variant="secondary" className="font-semibold">
          Mulai Sekarang
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
};

export default CTA;
