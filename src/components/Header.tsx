import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useConfigSistem } from "@/hooks/useConfigSistem";

const Header = () => {
  const { user } = useAuth();
  const { data: configs } = useConfigSistem();
  const logoUrl = configs?.find(c => c.key === 'logo_bkad_url')?.value;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo BKAD" 
              className="h-12 w-12 object-contain"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">SIMPA BEND BKADKU</span>
            <span className="text-xs text-muted-foreground">BKAD Kolaka Utara</span>
          </div>
        </div>
        <Button variant="default" className="font-semibold" asChild>
          <Link to={user ? "/dashboard" : "/login"}>
            {user ? "Dashboard" : "Masuk Sistem"}
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;
