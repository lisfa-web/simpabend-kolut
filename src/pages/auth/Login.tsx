import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useConfigSistem } from "@/hooks/useConfigSistem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  
  const { login, user } = useAuth();
  const { data: configs } = useConfigSistem();
  const navigate = useNavigate();
  const { toast } = useToast();

  const logoUrl = configs?.find(c => c.key === 'logo_bkad_url')?.value;

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

    if (!email || !password) {
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

    const { error: loginError } = await login(email, password);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo BKAD" 
              className="h-20 w-20 object-contain mb-4"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4">
              <FileText className="h-10 w-10 text-primary-foreground" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">SIMPA BEND BKADKU</h1>
          <p className="text-sm text-muted-foreground">BKAD Kolaka Utara</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Masuk ke sistem monitoring dan validasi digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="captcha">Captcha: {captchaNum1} + {captchaNum2} = ?</Label>
                <Input
                  id="captcha"
                  type="number"
                  placeholder="Jawaban"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Link to="/" className="hover:text-primary transition-colors">
                  Kembali ke Beranda
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
