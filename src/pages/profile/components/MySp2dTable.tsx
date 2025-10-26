import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useUserSp2dActivity } from "@/hooks/useUserSp2dActivity";
import { Sp2dStatusBadge } from "@/pages/spm/components/Sp2dStatusBadge";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Search, Eye, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const getRoleLabel = (sp2d: any, userId: string): string => {
  if (sp2d.created_by === userId) return "Pembuat";
  if (sp2d.verified_by === userId) return "Verifikator";
  if (sp2d.kuasa_bud_id === userId) return "Kuasa BUD";
  if (sp2d.spm?.bendahara_id === userId) return "Bendahara SPM";
  return "Terkait";
};

const MySp2dTable = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: sp2dData, isLoading } = useUserSp2dActivity({
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nomor SP2D atau nomor SPM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="diproses">Diproses</SelectItem>
              <SelectItem value="diterbitkan">Diterbitkan</SelectItem>
              <SelectItem value="cair">Dicairkan</SelectItem>
              <SelectItem value="gagal">Gagal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor SP2D</TableHead>
                <TableHead>Nomor SPM</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Peran Saya</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!sp2dData?.data || sp2dData.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Belum ada SP2D yang dikerjakan
                  </TableCell>
                </TableRow>
              ) : (
                sp2dData.data.map((sp2d: any) => (
                  <TableRow key={sp2d.id}>
                    <TableCell className="font-medium">
                      {sp2d.nomor_sp2d}
                    </TableCell>
                    <TableCell>{sp2d.spm?.nomor_spm || "-"}</TableCell>
                    <TableCell>
                      {sp2d.tanggal_sp2d
                        ? format(new Date(sp2d.tanggal_sp2d), "dd MMM yyyy", { locale: id })
                        : "-"}
                    </TableCell>
                    <TableCell>{formatCurrency(sp2d.nilai_sp2d)}</TableCell>
                    <TableCell>
                      <Sp2dStatusBadge status={sp2d.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getRoleLabel(sp2d, user?.id || "")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/sp2d/${sp2d.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default MySp2dTable;
