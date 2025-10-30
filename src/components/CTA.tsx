import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
const CTA = () => {
  return <section className="container py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border-2 px-8 py-16 text-center bg-gradient-to-br from-primary/10 to-accent/5">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Meningkatkan Transparansi dan Efisiensi?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan sistem digital yang modern dan terpercaya untuk manajemen keuangan daerah
          </p>
          <Button size="lg" className="font-semibold" asChild>
            <Link to="/dashboard">
              Mulai Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>;
};
export default CTA;