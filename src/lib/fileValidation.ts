export interface FileValidationRule {
  maxSize: number; // in bytes
  allowedTypes: string[];
}

export const FILE_VALIDATION_RULES: Record<string, FileValidationRule> = {
  dokumen_spm: {
    maxSize: 5 * 1024 * 1024, // 5MB default
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  },
  tbk: {
    maxSize: 5 * 1024 * 1024, // 5MB default
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  },
  spj: {
    maxSize: 5 * 1024 * 1024, // 5MB default
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  },
  lainnya: {
    maxSize: 10 * 1024 * 1024, // 10MB default
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
};

export const getFileValidationRule = (
  jenisLampiran: string,
  maxSizeMB?: number
): FileValidationRule => {
  const baseRule = FILE_VALIDATION_RULES[jenisLampiran];
  if (!baseRule) {
    return FILE_VALIDATION_RULES.lainnya;
  }
  
  if (maxSizeMB !== undefined) {
    return {
      ...baseRule,
      maxSize: maxSizeMB * 1024 * 1024,
    };
  }
  
  return baseRule;
};

export const validateFile = (
  file: File,
  rule: FileValidationRule
): { valid: boolean; error?: string } => {
  if (file.size > rule.maxSize) {
    return {
      valid: false,
      error: `Ukuran file maksimal ${(rule.maxSize / 1024 / 1024).toFixed(0)}MB`,
    };
  }

  if (!rule.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipe file tidak didukung',
    };
  }

  return { valid: true };
};

export const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('word')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  return '📎';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

export const isPdfFile = (fileName: string): boolean => {
  return fileName.toLowerCase().endsWith('.pdf');
};

export const getFileMimeType = (fileName: string): string => {
  const extension = fileName.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
  };
  return mimeTypes[extension || ''] || 'application/octet-stream';
};
