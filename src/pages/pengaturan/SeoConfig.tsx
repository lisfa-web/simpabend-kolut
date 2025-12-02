import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSeoConfig, useSeoMutation } from "@/hooks/useSeoConfig";
import { 
  Search, 
  Globe, 
  Share2, 
  Code, 
  FileText, 
  Save, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye
} from "lucide-react";
import { toast } from "sonner";

const SeoConfig = () => {
  const { data: configs, isLoading, refetch } = useSeoConfig();
  const { updateMultiple } = useSeoMutation();
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (configs) {
      const data: Record<string, string> = {};
      configs.forEach((c) => {
        data[c.key] = c.value || "";
      });
      setFormData(data);
    }
  }, [configs]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    const updates = Object.entries(formData).map(([key, value]) => ({
      key,
      value,
    }));

    await updateMultiple.mutateAsync(updates);
    setIsDirty(false);
  };

  const handlePreview = () => {
    const url = formData.canonical_url || window.location.origin;
    window.open(`https://cards-dev.twitter.com/validator`, "_blank");
    toast.info("Gunakan URL: " + url + " untuk preview");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Search className="h-8 w-8 text-primary" />
              Pengaturan SEO
            </h1>
            <p className="text-muted-foreground">
              Optimalkan website untuk mesin pencari seperti Google, Bing, dan lainnya
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={!isDirty || updateMultiple.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMultiple.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>

        {/* SEO Score Card */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Status SEO</h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.site_title && formData.site_description ? "Konfigurasi dasar sudah lengkap" : "Perlu melengkapi konfigurasi"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {formData.google_verification && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Google Verified
                  </Badge>
                )}
                {formData.bing_verification && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    Bing Verified
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Dasar</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Sosial Media</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Verifikasi</span>
            </TabsTrigger>
            <TabsTrigger value="structured" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Structured Data</span>
            </TabsTrigger>
            <TabsTrigger value="robots" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Robots.txt</span>
            </TabsTrigger>
          </TabsList>

          {/* Basic SEO */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan SEO Dasar</CardTitle>
                <CardDescription>
                  Konfigurasi meta tags dasar untuk optimasi mesin pencari
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="site_title">Judul Website (Title Tag)</Label>
                  <Input
                    id="site_title"
                    value={formData.site_title || ""}
                    onChange={(e) => handleChange("site_title", e.target.value)}
                    placeholder="SIMPA BEND BKADKU - Sistem Informasi Manajemen"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.site_title?.length || 0}/60 karakter (disarankan max 60)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_description">Deskripsi Website (Meta Description)</Label>
                  <Textarea
                    id="site_description"
                    value={formData.site_description || ""}
                    onChange={(e) => handleChange("site_description", e.target.value)}
                    placeholder="Platform digital untuk memonitor, mengontrol, mendokumentasi..."
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.site_description?.length || 0}/160 karakter (disarankan max 160)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_keywords">Keywords (Kata Kunci)</Label>
                  <Input
                    id="site_keywords"
                    value={formData.site_keywords || ""}
                    onChange={(e) => handleChange("site_keywords", e.target.value)}
                    placeholder="SIMPA BEND, BKAD, Kolaka Utara, SPM, SP2D"
                  />
                  <p className="text-xs text-muted-foreground">
                    Pisahkan dengan koma. Fokus pada 5-10 kata kunci utama.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    value={formData.canonical_url || ""}
                    onChange={(e) => handleChange("canonical_url", e.target.value)}
                    placeholder="https://simpa-bend.lovable.app"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL utama website untuk menghindari duplicate content
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Open Graph & Social Media</CardTitle>
                <CardDescription>
                  Konfigurasi tampilan website saat dibagikan di sosial media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="og_image">Open Graph Image URL</Label>
                  <Input
                    id="og_image"
                    value={formData.og_image || ""}
                    onChange={(e) => handleChange("og_image", e.target.value)}
                    placeholder="/og-image.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Gambar yang ditampilkan saat website dibagikan (1200x630px disarankan)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter_handle">Twitter/X Handle</Label>
                  <Input
                    id="twitter_handle"
                    value={formData.twitter_handle || ""}
                    onChange={(e) => handleChange("twitter_handle", e.target.value)}
                    placeholder="@bkadkolut"
                  />
                </div>

                <Separator />

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </h4>
                  <div className="border rounded-lg overflow-hidden bg-background">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {formData.og_image ? (
                        <img 
                          src={formData.og_image.startsWith('/') ? formData.og_image : formData.og_image} 
                          alt="OG Preview"
                          className="max-h-full max-w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-muted-foreground">No image</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground uppercase">{formData.canonical_url?.replace(/https?:\/\//, '') || 'simpa-bend.lovable.app'}</p>
                      <p className="font-semibold line-clamp-1">{formData.site_title || 'Judul Website'}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{formData.site_description || 'Deskripsi website...'}</p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Test di Twitter Card Validator
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification */}
          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verifikasi Search Engine</CardTitle>
                <CardDescription>
                  Verifikasi kepemilikan website untuk Google Search Console dan Bing Webmaster
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="google_verification" className="flex items-center gap-2">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
                    Google Search Console
                  </Label>
                  <Input
                    id="google_verification"
                    value={formData.google_verification || ""}
                    onChange={(e) => handleChange("google_verification", e.target.value)}
                    placeholder="google-site-verification code"
                  />
                  <p className="text-xs text-muted-foreground">
                    Dapatkan dari{" "}
                    <a 
                      href="https://search.google.com/search-console" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google Search Console
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bing_verification" className="flex items-center gap-2">
                    <img src="https://www.bing.com/favicon.ico" alt="Bing" className="h-4 w-4" />
                    Bing Webmaster Tools
                  </Label>
                  <Input
                    id="bing_verification"
                    value={formData.bing_verification || ""}
                    onChange={(e) => handleChange("bing_verification", e.target.value)}
                    placeholder="bing verification code"
                  />
                  <p className="text-xs text-muted-foreground">
                    Dapatkan dari{" "}
                    <a 
                      href="https://www.bing.com/webmasters" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Bing Webmaster Tools
                    </a>
                  </p>
                </div>

                <Separator />

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Langkah Verifikasi Google:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Buka Google Search Console dan tambahkan property</li>
                    <li>Pilih metode verifikasi "HTML tag"</li>
                    <li>Salin kode verification (hanya nilai content)</li>
                    <li>Paste di field di atas dan simpan</li>
                    <li>Klik "Verify" di Search Console</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structured Data */}
          <TabsContent value="structured">
            <Card>
              <CardHeader>
                <CardTitle>Structured Data (JSON-LD)</CardTitle>
                <CardDescription>
                  Schema.org markup untuk rich snippets di hasil pencarian
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="structured_data_org">Organization Schema</Label>
                  <Textarea
                    id="structured_data_org"
                    value={formData.structured_data_org || ""}
                    onChange={(e) => handleChange("structured_data_org", e.target.value)}
                    placeholder='{"@context":"https://schema.org","@type":"Organization"...}'
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    JSON-LD format. Validasi di{" "}
                    <a 
                      href="https://validator.schema.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Schema Validator
                    </a>
                  </p>
                </div>

                <Separator />

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Template Structured Data:</h4>
                  <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  "name": "BKAD Kabupaten Kolaka Utara",
  "url": "https://simpa-bend.lovable.app",
  "logo": "https://simpa-bend.lovable.app/logo.png",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Kolaka Utara",
    "addressRegion": "Sulawesi Tenggara",
    "addressCountry": "ID"
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Robots.txt */}
          <TabsContent value="robots">
            <Card>
              <CardHeader>
                <CardTitle>Robots.txt</CardTitle>
                <CardDescription>
                  Kontrol bagaimana crawler mesin pencari mengakses website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="robots_txt">Isi Robots.txt</Label>
                  <Textarea
                    id="robots_txt"
                    value={formData.robots_txt || ""}
                    onChange={(e) => handleChange("robots_txt", e.target.value)}
                    placeholder="User-agent: *&#10;Allow: /"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-600">Catatan</p>
                    <p className="text-muted-foreground">
                      File robots.txt statis sudah ada di /public/robots.txt. 
                      Konfigurasi di sini disimpan untuk referensi dan dapat digunakan untuk generate ulang file.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Template Robots.txt Optimal:</h4>
                  <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/

Sitemap: https://simpa-bend.lovable.app/sitemap.xml`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SeoConfig;
