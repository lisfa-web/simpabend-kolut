import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const VerificationBadge = ({ isVerified }: { isVerified: boolean | null }) => {
  if (isVerified === null) {
    return (
      <Badge variant="outline" className="gap-1 bg-muted/50">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  }
  
  return isVerified ? (
    <Badge variant="default" className="gap-1 bg-success/20 text-success border-success/30">
      <CheckCircle className="h-3 w-3" />
      Verified
    </Badge>
  ) : (
    <Badge variant="destructive" className="gap-1 bg-destructive/20 text-destructive border-destructive/30">
      <XCircle className="h-3 w-3" />
      Rejected
    </Badge>
  );
};

const Sp2dStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    diterbitkan: { label: "Diterbitkan", className: "bg-blue-500/20 text-blue-700 border-blue-300" },
    terkirim_bank: { label: "Terkirim Bank", className: "bg-purple-500/20 text-purple-700 border-purple-300" },
    dikonfirmasi_bank: { label: "Dikonfirmasi", className: "bg-indigo-500/20 text-indigo-700 border-indigo-300" },
    cair: { label: "Cair", className: "bg-green-500/20 text-green-700 border-green-300" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.diterbitkan;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export const SpmSp2dTableWidget = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ["spm-sp2d-table", page, pageSize],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("spm")
        .select(`
          id,
          nomor_antrian,
          tanggal_ajuan,
          nomor_spm,
          nama_penerima,
          verified_by_pbmd,
          verified_by_akuntansi,
          verified_by_perbendaharaan,
          status,
          opd:opd_id(nama_opd),
          sp2d(
            id,
            nomor_sp2d,
            nilai_sp2d,
            status,
            tanggal_cair
          )
        `, { count: 'exact' })
        .not("status", "eq", "draft")
        .order("tanggal_ajuan", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const totalPages = Math.ceil((data?.count || 0) / pageSize);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Tabel SPM & SP2D</CardTitle>
          </div>
          <Badge variant="secondary" className="font-mono">
            {data?.count || 0} Records
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Informasi SPM</TableHead>
                <TableHead className="font-semibold">Penerima</TableHead>
                <TableHead className="font-semibold text-center">PBMD</TableHead>
                <TableHead className="font-semibold text-center">Akuntansi</TableHead>
                <TableHead className="font-semibold text-center">Perbendaharaan</TableHead>
                <TableHead className="font-semibold">Nomor SP2D</TableHead>
                <TableHead className="font-semibold">Nilai SP2D</TableHead>
                <TableHead className="font-semibold">Status SP2D</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading data...
                  </TableCell>
                </TableRow>
              ) : data?.data && data.data.length > 0 ? (
                data.data.map((spm: any) => {
                  const sp2d = Array.isArray(spm.sp2d) ? spm.sp2d[0] : spm.sp2d;
                  
                  return (
                    <TableRow key={spm.id} className="hover:bg-accent/5">
                      <TableCell>
                        <div className="flex flex-col gap-1 min-w-[280px]">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">No. Antrian:</span>
                            <span className="font-mono text-sm font-medium">{spm.nomor_antrian || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Tanggal:</span>
                            <span className="text-sm">
                              {spm.tanggal_ajuan
                                ? format(new Date(spm.tanggal_ajuan), "dd MMM yyyy", { locale: id })
                                : "-"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">No. SPM:</span>
                            <span className="font-mono text-sm font-medium">{spm.nomor_spm || "-"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium text-sm truncate">{spm.nama_penerima}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {spm.opd?.nama_opd}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <VerificationBadge
                          isVerified={
                            // If SPM is approved or has SP2D, all verifications are done
                            spm.status === "disetujui" || sp2d
                              ? true
                              : spm.verified_by_pbmd
                              ? spm.status !== "perlu_revisi"
                              : null
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <VerificationBadge
                          isVerified={
                            // If SPM is approved or has SP2D, all verifications are done
                            spm.status === "disetujui" || sp2d
                              ? true
                              : spm.verified_by_akuntansi
                              ? spm.status !== "perlu_revisi"
                              : null
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <VerificationBadge
                          isVerified={
                            // If SPM is approved or has SP2D, all verifications are done
                            spm.status === "disetujui" || sp2d
                              ? true
                              : spm.verified_by_perbendaharaan
                              ? spm.status !== "perlu_revisi"
                              : null
                          }
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {sp2d?.nomor_sp2d || "-"}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {sp2d?.nilai_sp2d ? formatCurrency(sp2d.nilai_sp2d) : "-"}
                      </TableCell>
                      <TableCell>
                        {sp2d?.status ? (
                          <div className="flex flex-col gap-1">
                            <Sp2dStatusBadge status={sp2d.status} />
                            {sp2d.status === "cair" && sp2d.tanggal_cair && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(sp2d.tanggal_cair), "dd MMM yyyy", { locale: id })}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-muted/50">
                            No SP2D
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="border-t p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages || 1}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
