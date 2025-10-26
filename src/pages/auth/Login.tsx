import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useConfigSistem } from "@/hooks/useConfigSistem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Loader2, AlertCircle, Mail, Lock, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, user } = useAuth();
  const { data: configs } = useConfigSistem();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Cache logo URL in localStorage (24 hours TTL)
  const getCachedLogoUrl = () => {
    const cached = localStorage.getItem('bkad_logo_cache');
    if (cached) {
      const { url, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours
      if (!isExpired) return url;
    }
    
    const configUrl = configs?.find(c => c.key === 'logo_bkad_url')?.value;
    const logoUrl = configUrl || "https://storage.googleapis.com/gpt-engineer-file-uploads/YiG4vutaHxeJX1je6rv0tIwuuYZ2/uploads/1761358201412-Lambang_Kabupaten_Kolaka_Utara.png";
    
    if (configUrl) {
      localStorage.setItem('bkad_logo_cache', JSON.stringify({ 
        url: logoUrl, 
        timestamp: Date.now() 
      }));
    }
    
    return logoUrl;
  };

  const logoUrl = getCachedLogoUrl();

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaNum1(num1);
    setCaptchaNum2(num2);
    setCaptchaAnswer("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim();
    
    if (!trimmedEmail || !password) {
      setError("Email dan password harus diisi");
      setLoading(false);
      return;
    }

    const correctAnswer = captchaNum1 + captchaNum2;
    if (parseInt(captchaAnswer) !== correctAnswer) {
      setError("Jawaban captcha salah");
      setLoading(false);
      generateCaptcha();
      return;
    }

    const { error: loginError } = await login(trimmedEmail, password);

    if (loginError) {
      setError(loginError.message === "Invalid login credentials" 
        ? "Email atau password salah" 
        : "Terjadi kesalahan saat login");
      setLoading(false);
      generateCaptcha();
      return;
    }

    toast({
      title: "Login berhasil",
      description: "Selamat datang di SIMPA BEND",
    });

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <header className="flex flex-col items-center mb-8" role="banner">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo BKAD Kolaka Utara" 
              className="h-24 w-24 object-contain mb-4"
              width="96"
              height="96"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary mb-4">
              <FileText className="h-12 w-12 text-primary-foreground" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">SIMPA BEND BKADKU</h1>
          <p className="text-sm text-muted-foreground font-medium">BKAD Kolaka Utara</p>
        </header>

        {/* Card */}
        <Card className="border" role="main">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold">Selamat Datang</CardTitle>
            <CardDescription className="text-base">
              Masuk ke sistem monitoring dan validasi digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <Alert variant="destructive" role="alert" aria-live="polite">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email field with icon */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    aria-required="true"
                    aria-invalid={!!error}
                    className="pl-10 h-11 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password field with icon and toggle */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    aria-required="true"
                    className="pl-10 pr-10 h-11 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Captcha field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="captcha" className="text-sm font-semibold">
                    Captcha: {captchaNum1} + {captchaNum2} = ?
                  </Label>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                    disabled={loading}
                    aria-label="Refresh captcha"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </button>
                </div>
                <Input
                  id="captcha"
                  type="number"
                  inputMode="numeric"
                  placeholder="Masukkan jawaban"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  disabled={loading}
                  required
                  aria-required="true"
                  aria-describedby="captcha-hint"
                  className="h-11 transition-all duration-200"
                />
                <span id="captcha-hint" className="sr-only">
                  Masukkan hasil penjumlahan untuk verifikasi
                </span>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold transition-all duration-200 hover:shadow-lg" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>

              <div className="text-center text-sm">
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-primary font-medium inline-flex items-center gap-1"
                >
                  ← Kembali ke Beranda
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer info */}
        <footer className="text-center text-xs text-muted-foreground mt-6">
          © 2024 BKAD Kolaka Utara. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Login;
