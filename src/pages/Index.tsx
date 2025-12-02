import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEOHead 
        canonicalPath="/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "SIMPA BEND BKADKU",
          "applicationCategory": "GovernmentApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "IDR"
          }
        }}
      />
      <Header />
      <Hero />
      <Features />
      <CTA />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
