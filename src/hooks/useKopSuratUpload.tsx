import { supabase } from "@/integrations/supabase/client";

export const useKopSuratUpload = () => {
  const uploadKopSurat = async (file: File): Promise<string> => {
    // Validasi file
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Format file harus PNG, JPG, atau PDF');
    }
    
    if (file.size > maxSize) {
      throw new Error('Ukuran file maksimal 2MB');
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('kop-surat')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = supabase.storage
      .from('kop-surat')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };
  
  const deleteKopSurat = async (url: string) => {
    const path = url.split('/kop-surat/')[1];
    if (!path) return;
    
    const { error } = await supabase.storage
      .from('kop-surat')
      .remove([path]);
    
    if (error) throw error;
  };
  
  return { uploadKopSurat, deleteKopSurat };
};
