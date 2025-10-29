import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Pencil, Loader2 } from "lucide-react";
import { useBendaharaPengeluaranList } from "@/hooks/useBendaharaPengeluaranList";

const BendaharaPengeluaranList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: bendaharaList, isLoading } = useBendaharaPengeluaranList({ is_active: true });

  const filteredData = bendaharaList?.filter((item) =>
    item.nama_bendahara.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nip?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Bendahara Pengeluaran</h1>
            <p className="text-muted-foreground mt-1">
              Kelola data bendahara pengeluaran
            </p>
          </div>
          <Button onClick={() => navigate("/masterdata/bendahara-pengeluaran/tambah")}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Bendahara
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Bendahara Pengeluaran</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama atau NIP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>NIP</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData && filteredData.length > 0 ? (
                      filteredData.map((bendahara) => (
                        <TableRow key={bendahara.id}>
                          <TableCell className="font-medium">
                            {bendahara.nama_bendahara}
                          </TableCell>
                          <TableCell>{bendahara.nip || "-"}</TableCell>
                          <TableCell>{bendahara.telepon || "-"}</TableCell>
                          <TableCell>{bendahara.email || "-"}</TableCell>
                          <TableCell>
                            {bendahara.nama_bank ? (
                              <div className="text-sm">
                                <div>{bendahara.nama_bank}</div>
                                <div className="text-muted-foreground">
                                  {bendahara.nomor_rekening}
                                </div>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={bendahara.is_active ? "default" : "secondary"}>
                              {bendahara.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/masterdata/bendahara-pengeluaran/edit/${bendahara.id}`)
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm
                            ? "Tidak ada data yang sesuai dengan pencarian"
                            : "Belum ada data bendahara pengeluaran"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BendaharaPengeluaranList;
