import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Trash2,
  Search,
  FileArchive,
  Eye,
  HardDrive,
  Filter,
} from "lucide-react";
import { useStorageManager, StorageFile } from "@/hooks/useStorageManager";
import { formatFileSize, getFileIcon } from "@/lib/fileValidation";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function FileManager() {
  const {
    files,
    isLoading,
    selectedBucket,
    setSelectedBucket,
    searchTerm,
    setSearchTerm,
    downloadFile,
    downloadAsZip,
    deleteFile,
    deleteMultiple,
    isDeletingFile,
    isDeletingMultiple,
    buckets,
    getTotalSize,
  } = useStorageManager();

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<StorageFile | null>(null);
  const [zipName, setZipName] = useState("");
  const [showZipDialog, setShowZipDialog] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    } else {
      setSelectedFiles(new Set());
    }
  };

  const handleSelectFile = (fileId: string, checked: boolean) => {
    const newSelected = new Set(selectedFiles);
    if (checked) {
      newSelected.add(fileId);
    } else {
      newSelected.delete(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleDownloadSelected = () => {
    const selected = files.filter((f) => selectedFiles.has(f.id));
    if (selected.length === 0) return;

    if (selected.length === 1) {
      downloadFile(selected[0]);
    } else {
      setZipName(`files-${format(new Date(), "yyyyMMdd-HHmmss")}.zip`);
      setShowZipDialog(true);
    }
  };

  const handleZipDownload = () => {
    const selected = files.filter((f) => selectedFiles.has(f.id));
    downloadAsZip(selected, zipName);
    setShowZipDialog(false);
    setSelectedFiles(new Set());
  };

  const handleDeleteSelected = () => {
    const selected = files.filter((f) => selectedFiles.has(f.id));
    if (selected.length === 0) return;
    deleteMultiple(selected);
    setSelectedFiles(new Set());
  };

  const isImage = (filename: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  };

  const isPdf = (filename: string) => {
    return /\.pdf$/i.test(filename);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">File Manager</h1>
          <p className="text-muted-foreground mt-2">
            Kelola semua file yang tersimpan di storage
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Files
            </CardTitle>
            <CardDescription>
              Total: {files.length} file(s) • {formatFileSize(getTotalSize())}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Cari File</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Cari nama file..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="bucket">Bucket</Label>
                <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                  <SelectTrigger id="bucket">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Bucket</SelectItem>
                    {buckets.map((bucket) => (
                      <SelectItem key={bucket} value={bucket}>
                        {bucket}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedFiles.size > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">
                  {selectedFiles.size} file terpilih
                </span>
                <div className="flex gap-2 ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadSelected}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    disabled={isDeletingMultiple}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </Button>
                </div>
              </div>
            )}

            {/* File Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          files.length > 0 &&
                          selectedFiles.size === files.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Bucket</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Tanggal Upload</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : files.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Tidak ada file
                      </TableCell>
                    </TableRow>
                  ) : (
                    files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedFiles.has(file.id)}
                            onCheckedChange={(checked) =>
                              handleSelectFile(file.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {getFileIcon(file.name)}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {file.name.split('/').pop()}
                              </span>
                              {file.name.includes('/') && (
                                <span className="text-xs text-muted-foreground">
                                  {file.name.substring(0, file.name.lastIndexOf('/'))}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{file.bucket}</Badge>
                        </TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>
                          {format(new Date(file.created_at), "dd MMM yyyy HH:mm", {
                            locale: id,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {(isImage(file.name) || isPdf(file.name)) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setPreviewFile(file)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadFile(file)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirm(file)}
                              disabled={isDeletingFile}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
            <DialogDescription>
              {previewFile?.bucket} • {formatFileSize(previewFile?.size || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh]">
            {previewFile && isImage(previewFile.name) && (
              <img
                src={previewFile.publicUrl}
                alt={previewFile.name}
                className="w-full h-auto"
              />
            )}
            {previewFile && isPdf(previewFile.name) && (
              <iframe
                src={previewFile.publicUrl}
                className="w-full h-[600px]"
                title={previewFile.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ZIP Dialog */}
      <Dialog open={showZipDialog} onOpenChange={setShowZipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download sebagai ZIP</DialogTitle>
            <DialogDescription>
              Masukkan nama file ZIP untuk {selectedFiles.size} file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="zipName">Nama File ZIP</Label>
              <Input
                id="zipName"
                value={zipName}
                onChange={(e) => setZipName(e.target.value)}
                placeholder="files.zip"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowZipDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleZipDownload}>
                <FileArchive className="h-4 w-4 mr-2" />
                Download ZIP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus File?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus file "{deleteConfirm?.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  deleteFile(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
