export const useLetterPreview = () => {
  const sampleData = {
    nama_opd: "DINAS PENGELOLAAN KEUANGAN DAN ASET DAERAH",
    nomor_surat: "001/SPM/DPPKAD/2024",
    tanggal: "1 Januari 2024",
    nama_pejabat: "Dr. H. Ahmad Budiman, S.E., M.M.",
    nip_pejabat: "198001012005011001",
    jabatan_pejabat: "Kepala Badan Keuangan dan Aset Daerah",
    jenis_surat: "Surat Keterangan",
    nomor_spm: "SPM-001/2024",
    nilai_spm: "Rp 50.000.000,00",
    vendor: "PT. Contoh Vendor Indonesia",
  };

  const replaceVariables = (
    content: string,
    data: Record<string, string>,
    useSampleData: boolean = false
  ): string => {
    if (!content) return "";

    let replacedContent = content;
    const dataToUse = useSampleData ? sampleData : data;

    // Replace all variables with provided data or sample data
    Object.entries(dataToUse).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      replacedContent = replacedContent.replace(regex, value || `{{${key}}}`);
    });

    return replacedContent;
  };

  return { sampleData, replaceVariables };
};
