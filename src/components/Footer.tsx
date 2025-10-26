import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">SIMPA BEND</h3>
                <p className="text-xs text-muted-foreground">BKAD Kolaka Utara</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Sistem Informasi Manajemen Pertanggungjawaban Bendahara untuk transparansi dan efisiensi keuangan daerah.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigasi Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/tentang" className="text-muted-foreground hover:text-primary transition-colors">
                  Tentang Sistem
                </Link>
              </li>
              <li>
                <Link to="/panduan" className="text-muted-foreground hover:text-primary transition-colors">
                  Panduan Manual
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Informasi Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <span>BKAD Kolaka Utara, Sulawesi Tenggara</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>(0123) 456-7890</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>info@bkadkolut.go.id</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 BKAD Kolaka Utara. Sistem Informasi SIMPA BEND BKADKU.</p>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-primary transition-colors">
                Kebijakan Privasi
              </Link>
              <Link to="#" className="hover:text-primary transition-colors">
                Syarat & Ketentuan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
