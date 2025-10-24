import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, FileIcon } from "lucide-react";
import { validateFile, getFileValidationRule, formatFileSize, getFileIcon } from "@/lib/fileValidation";
import { toast } from "@/hooks/use-toast";

interface FileUploadCardProps {
  jenisLampiran: string;
  label: string;
  required?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  maxSizeMB?: number;
}

export const FileUploadCard = ({
  jenisLampiran,
  label,
  required = false,
  files,
  onFilesChange,
  multiple = true,
  maxSizeMB,
}: FileUploadCardProps) => {
  const [dragActive, setDragActive] = useState(false);

  const rule = getFileValidationRule(jenisLampiran, maxSizeMB);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles: File[] = [];
    
    Array.from(newFiles).forEach((file) => {
      const validation = validateFile(file, rule);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast({
          title: "File tidak valid",
          description: `${file.name}: ${validation.error}`,
          variant: "destructive",
        });
      }
    });

    if (validFiles.length > 0) {
      onFilesChange(multiple ? [...files, ...validFiles] : [validFiles[0]]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
          <span className="text-xs text-muted-foreground">
            Max {(() => {
              const mb = rule.maxSize / 1024 / 1024;
              if (mb < 1) {
                return `${(rule.maxSize / 1024).toFixed(0)}KB`;
              }
              return `${mb.toFixed(mb >= 10 ? 0 : 1)}MB`;
            })()}
          </span>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-muted"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-input-${jenisLampiran}`)?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            Drag & drop atau klik untuk upload
          </p>
          <p className="text-xs text-muted-foreground">
            {rule.allowedTypes.map((type) => type.split("/")[1]).join(", ").toUpperCase()}
          </p>
          <input
            id={`file-input-${jenisLampiran}`}
            type="file"
            className="hidden"
            onChange={handleChange}
            multiple={multiple}
            accept={rule.allowedTypes.join(",")}
          />
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg"
              >
                <span className="text-2xl">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
