import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useUserList } from "@/hooks/useUserList";
import { ExportButton } from "@/pages/laporan/components/ExportButton";
import { AuditDetailModal } from "./components/AuditDetailModal";
import { Search, Eye } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

const AuditTrail = () => {
  const [filters, setFilters] = useState({
    tanggal_dari: "",
    tanggal_sampai: "",
    user_id: "all",
    action: "all",
    resource: "all",
    search: "",
  });
  
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: auditLogs, isLoading } = useAuditLog(filters);
  const { data: users } = useUserList();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      tanggal_dari: "",
      tanggal_sampai: "",
      user_id: "all",
      action: "all",
      resource: "all",
      search: "",
    });
  };

  const handleViewDetail = (audit: any) => {
    setSelectedAudit(audit);
    setModalOpen(true);
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getResourceLabel = (resource: string) => {
    const labels: Record<string, string> = {
      spm: "SPM",
      sp2d: "SP2D",
      profiles: "Profil User",
      user_roles: "Role User",
      opd: "OPD",
      vendor: "Vendor",
      program: "Program",
      kegiatan: "Kegiatan",
      subkegiatan: "Sub Kegiatan",
    };
    return labels[resource] || resource;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Trail</h1>
            <p className="text-muted-foreground mt-2">
              Log aktivitas dan perubahan data sistem
            </p>
          </div>
          <ExportButton data={auditLogs || []} filename="audit-trail" />
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Tanggal Dari</Label>
                <Input
                  type="date"
                  value={filters.tanggal_dari}
                  onChange={(e) =>
                    handleFilterChange("tanggal_dari", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Tanggal Sampai</Label>
                <Input
                  type="date"
                  value={filters.tanggal_sampai}
                  onChange={(e) =>
                    handleFilterChange("tanggal_sampai", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>User</Label>
                <Select
                  value={filters.user_id}
                  onValueChange={(value) => handleFilterChange("user_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua User</SelectItem>
                    {users?.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Aksi</Label>
                <Select
                  value={filters.action}
                  onValueChange={(value) => handleFilterChange("action", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Aksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Aksi</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Resource</Label>
                <Select
                  value={filters.resource}
                  onValueChange={(value) => handleFilterChange("resource", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Resource</SelectItem>
                    <SelectItem value="spm">SPM</SelectItem>
                    <SelectItem value="sp2d">SP2D</SelectItem>
                    <SelectItem value="profiles">Profil User</SelectItem>
                    <SelectItem value="user_roles">Role User</SelectItem>
                    <SelectItem value="opd">OPD</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cari Resource ID</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari berdasarkan ID..."
                    className="pl-9"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={handleReset}>
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Resource ID</TableHead>
                  <TableHead className="text-right">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : auditLogs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Tidak ada data audit log
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs?.map((audit: any) => (
                    <TableRow key={audit.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(audit.created_at), "dd/MM/yyyy HH:mm", {
                          locale: localeId,
                        })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {audit.user?.full_name || "-"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {audit.user?.email || "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(audit.action)}>
                          {audit.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{getResourceLabel(audit.resource)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {audit.resource_id?.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(audit)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AuditDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        data={selectedAudit}
      />
    </DashboardLayout>
  );
};

export default AuditTrail;
