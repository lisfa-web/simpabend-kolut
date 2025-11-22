import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import JSZip from "jszip";

export interface StorageFile {
  id: string;
  name: string;
  bucket: string;
  size: number;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: any;
  publicUrl: string;
}

const BUCKETS = ["ttd-pejabat", "system-logos", "kop-surat", "spm-documents"];

export const useStorageManager = () => {
  const queryClient = useQueryClient();
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["storage-files", selectedBucket],
    queryFn: async () => {
      const allFiles: StorageFile[] = [];
      
      const bucketsToFetch = selectedBucket === "all" ? BUCKETS : [selectedBucket];
      
      // Helper function to recursively list files in folders
      const listFilesRecursive = async (bucket: string, path: string = ""): Promise<any[]> => {
        const { data, error } = await supabase.storage.from(bucket).list(path, {
          limit: 1000,
          sortBy: { column: "created_at", order: "desc" },
        });

        if (error) {
          console.error(`Error fetching from ${bucket}/${path}:`, error);
          return [];
        }

        if (!data) return [];

        const files: any[] = [];
        
        for (const item of data) {
          // Skip if it's a folder (id is null)
          if (item.id === null) {
            // Recursively list files in this folder
            const folderPath = path ? `${path}/${item.name}` : item.name;
            const nestedFiles = await listFilesRecursive(bucket, folderPath);
            files.push(...nestedFiles);
          } else {
            // It's a file, add it with full path
            const fullPath = path ? `${path}/${item.name}` : item.name;
            files.push({ ...item, fullPath });
          }
        }
        
        return files;
      };
      
      for (const bucket of bucketsToFetch) {
        const bucketFiles = await listFilesRecursive(bucket);

        const filesWithUrls = bucketFiles
          .filter(file => file.id !== null) // Only actual files, not folders
          .map((file) => {
            const { data: urlData } = supabase.storage
              .from(bucket)
              .getPublicUrl(file.fullPath || file.name);

            return {
              id: file.id || `${bucket}-${file.fullPath || file.name}`,
              name: file.fullPath || file.name,
              bucket,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
              updated_at: file.updated_at || new Date().toISOString(),
              last_accessed_at: file.last_accessed_at || new Date().toISOString(),
              metadata: file.metadata,
              publicUrl: urlData.publicUrl,
            };
          });

        allFiles.push(...filesWithUrls);
      }

      return allFiles;
    },
  });

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadFile = async (file: StorageFile) => {
    try {
      const { data, error } = await supabase.storage
        .from(file.bucket)
        .download(file.name);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`File ${file.name} berhasil didownload`);
    } catch (error: any) {
      toast.error(`Gagal download file: ${error.message}`);
    }
  };

  const downloadAsZip = async (selectedFiles: StorageFile[], zipName: string) => {
    try {
      const zip = new JSZip();
      
      toast.info("Membuat ZIP file...");

      for (const file of selectedFiles) {
        const { data, error } = await supabase.storage
          .from(file.bucket)
          .download(file.name);

        if (error) {
          console.error(`Error downloading ${file.name}:`, error);
          continue;
        }

        zip.file(`${file.bucket}/${file.name}`, data);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`ZIP file berhasil dibuat: ${zipName}`);
    } catch (error: any) {
      toast.error(`Gagal membuat ZIP: ${error.message}`);
    }
  };

  const deleteFile = useMutation({
    mutationFn: async (file: StorageFile) => {
      const { error } = await supabase.storage.from(file.bucket).remove([file.name]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storage-files"] });
      toast.success("File berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus file: ${error.message}`);
    },
  });

  const deleteMultiple = useMutation({
    mutationFn: async (files: StorageFile[]) => {
      const filesByBucket = files.reduce((acc, file) => {
        if (!acc[file.bucket]) acc[file.bucket] = [];
        acc[file.bucket].push(file.name);
        return acc;
      }, {} as Record<string, string[]>);

      for (const [bucket, fileNames] of Object.entries(filesByBucket)) {
        const { error } = await supabase.storage.from(bucket).remove(fileNames);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storage-files"] });
      toast.success("File berhasil dihapus");
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus file: ${error.message}`);
    },
  });

  const getTotalSize = () => {
    return filteredFiles.reduce((sum, file) => sum + file.size, 0);
  };

  return {
    files: filteredFiles,
    isLoading,
    selectedBucket,
    setSelectedBucket,
    searchTerm,
    setSearchTerm,
    downloadFile,
    downloadAsZip,
    deleteFile: deleteFile.mutate,
    deleteMultiple: deleteMultiple.mutate,
    isDeletingFile: deleteFile.isPending,
    isDeletingMultiple: deleteMultiple.isPending,
    buckets: BUCKETS,
    getTotalSize,
  };
};
