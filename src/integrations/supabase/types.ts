export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          resource: string
          resource_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          resource: string
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          resource?: string
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      config_sistem: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      email_config: {
        Row: {
          created_at: string | null
          from_email: string
          from_name: string
          id: string
          is_active: boolean | null
          last_test_at: string | null
          smtp_host: string
          smtp_password: string
          smtp_port: number
          smtp_user: string
          test_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_email: string
          from_name: string
          id?: string
          is_active?: boolean | null
          last_test_at?: string | null
          smtp_host?: string
          smtp_password: string
          smtp_port?: number
          smtp_user: string
          test_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_email?: string
          from_name?: string
          id?: string
          is_active?: boolean | null
          last_test_at?: string | null
          smtp_host?: string
          smtp_password?: string
          smtp_port?: number
          smtp_user?: string
          test_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      format_nomor: {
        Row: {
          counter: number | null
          created_at: string | null
          format: string
          id: string
          jenis_dokumen: string
          tahun: number
          updated_at: string | null
        }
        Insert: {
          counter?: number | null
          created_at?: string | null
          format: string
          id?: string
          jenis_dokumen: string
          tahun: number
          updated_at?: string | null
        }
        Update: {
          counter?: number | null
          created_at?: string | null
          format?: string
          id?: string
          jenis_dokumen?: string
          tahun?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      kegiatan: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          kode_kegiatan: string
          nama_kegiatan: string
          program_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kode_kegiatan: string
          nama_kegiatan: string
          program_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kode_kegiatan?: string
          nama_kegiatan?: string
          program_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kegiatan_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program"
            referencedColumns: ["id"]
          },
        ]
      }
      lampiran_spm: {
        Row: {
          created_at: string | null
          file_size: number | null
          file_url: string
          id: string
          jenis_lampiran: Database["public"]["Enums"]["jenis_lampiran"]
          nama_file: string
          spm_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          jenis_lampiran: Database["public"]["Enums"]["jenis_lampiran"]
          nama_file: string
          spm_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          jenis_lampiran?: Database["public"]["Enums"]["jenis_lampiran"]
          nama_file?: string
          spm_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lampiran_spm_spm_id_fkey"
            columns: ["spm_id"]
            isOneToOne: false
            referencedRelation: "spm"
            referencedColumns: ["id"]
          },
        ]
      }
      notifikasi: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          jenis: Database["public"]["Enums"]["jenis_notifikasi"]
          judul: string
          pesan: string
          sent_via_wa: boolean | null
          spm_id: string | null
          user_id: string
          wa_sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          jenis: Database["public"]["Enums"]["jenis_notifikasi"]
          judul: string
          pesan: string
          sent_via_wa?: boolean | null
          spm_id?: string | null
          user_id: string
          wa_sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          jenis?: Database["public"]["Enums"]["jenis_notifikasi"]
          judul?: string
          pesan?: string
          sent_via_wa?: boolean | null
          spm_id?: string | null
          user_id?: string
          wa_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifikasi_spm_id_fkey"
            columns: ["spm_id"]
            isOneToOne: false
            referencedRelation: "spm"
            referencedColumns: ["id"]
          },
        ]
      }
      opd: {
        Row: {
          alamat: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          kode_opd: string
          nama_opd: string
          telepon: string | null
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          kode_opd: string
          nama_opd: string
          telepon?: string | null
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          kode_opd?: string
          nama_opd?: string
          telepon?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pejabat: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          jabatan: string
          nama_lengkap: string
          nip: string
          opd_id: string | null
          ttd_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jabatan: string
          nama_lengkap: string
          nip: string
          opd_id?: string | null
          ttd_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jabatan?: string
          nama_lengkap?: string
          nip?: string
          opd_id?: string | null
          ttd_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pejabat_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          created_at: string | null
          id: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      pin_otp: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_used: boolean | null
          jenis: string
          kode_hash: string
          sp2d_id: string | null
          spm_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_used?: boolean | null
          jenis: string
          kode_hash: string
          sp2d_id?: string | null
          spm_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean | null
          jenis?: string
          kode_hash?: string
          sp2d_id?: string | null
          spm_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pin_otp_sp2d_id_fkey"
            columns: ["sp2d_id"]
            isOneToOne: false
            referencedRelation: "sp2d"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pin_otp_spm_id_fkey"
            columns: ["spm_id"]
            isOneToOne: false
            referencedRelation: "spm"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      program: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          kode_program: string
          nama_program: string
          tahun_anggaran: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kode_program: string
          nama_program: string
          tahun_anggaran: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kode_program?: string
          nama_program?: string
          tahun_anggaran?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      public_token: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          spm_id: string
          token: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          spm_id: string
          token: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          spm_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_token_spm_id_fkey"
            columns: ["spm_id"]
            isOneToOne: false
            referencedRelation: "spm"
            referencedColumns: ["id"]
          },
        ]
      }
      revisi_spm: {
        Row: {
          catatan_revisi: string
          created_at: string | null
          id: string
          revisi_by: string
          revisi_dari_status: Database["public"]["Enums"]["status_spm"]
          spm_id: string
        }
        Insert: {
          catatan_revisi: string
          created_at?: string | null
          id?: string
          revisi_by: string
          revisi_dari_status: Database["public"]["Enums"]["status_spm"]
          spm_id: string
        }
        Update: {
          catatan_revisi?: string
          created_at?: string | null
          id?: string
          revisi_by?: string
          revisi_dari_status?: Database["public"]["Enums"]["status_spm"]
          spm_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revisi_spm_spm_id_fkey"
            columns: ["spm_id"]
            isOneToOne: false
            referencedRelation: "spm"
            referencedColumns: ["id"]
          },
        ]
      }
      sp2d: {
        Row: {
          catatan: string | null
          created_at: string | null
          id: string
          kuasa_bud_id: string | null
          nama_bank: string | null
          nama_rekening: string | null
          nilai_sp2d: number
          nomor_rekening: string | null
          nomor_sp2d: string
          otp_verified_at: string | null
          spm_id: string
          status: Database["public"]["Enums"]["status_sp2d"] | null
          tanggal_cair: string | null
          tanggal_sp2d: string | null
          ttd_digital_url: string | null
          updated_at: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          kuasa_bud_id?: string | null
          nama_bank?: string | null
          nama_rekening?: string | null
          nilai_sp2d: number
          nomor_rekening?: string | null
          nomor_sp2d: string
          otp_verified_at?: string | null
          spm_id: string
          status?: Database["public"]["Enums"]["status_sp2d"] | null
          tanggal_cair?: string | null
          tanggal_sp2d?: string | null
          ttd_digital_url?: string | null
          updated_at?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          id?: string
          kuasa_bud_id?: string | null
          nama_bank?: string | null
          nama_rekening?: string | null
          nilai_sp2d?: number
          nomor_rekening?: string | null
          nomor_sp2d?: string
          otp_verified_at?: string | null
          spm_id?: string
          status?: Database["public"]["Enums"]["status_sp2d"] | null
          tanggal_cair?: string | null
          tanggal_sp2d?: string | null
          ttd_digital_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sp2d_spm_id_fkey"
            columns: ["spm_id"]
            isOneToOne: false
            referencedRelation: "spm"
            referencedColumns: ["id"]
          },
        ]
      }
      spm: {
        Row: {
          bendahara_id: string
          catatan_akuntansi: string | null
          catatan_kepala_bkad: string | null
          catatan_pbmd: string | null
          catatan_perbendaharaan: string | null
          catatan_resepsionis: string | null
          created_at: string | null
          id: string
          jenis_spm: Database["public"]["Enums"]["jenis_spm"]
          kegiatan_id: string | null
          nilai_spm: number
          nomor_antrian: string | null
          nomor_berkas: string | null
          nomor_spm: string | null
          opd_id: string
          pin_verified_at: string | null
          program_id: string | null
          status: Database["public"]["Enums"]["status_spm"] | null
          subkegiatan_id: string | null
          tanggal_ajuan: string | null
          tanggal_akuntansi: string | null
          tanggal_disetujui: string | null
          tanggal_kepala_bkad: string | null
          tanggal_pbmd: string | null
          tanggal_perbendaharaan: string | null
          tanggal_resepsionis: string | null
          updated_at: string | null
          uraian: string | null
          vendor_id: string | null
          verified_by_kepala_bkad: string | null
        }
        Insert: {
          bendahara_id: string
          catatan_akuntansi?: string | null
          catatan_kepala_bkad?: string | null
          catatan_pbmd?: string | null
          catatan_perbendaharaan?: string | null
          catatan_resepsionis?: string | null
          created_at?: string | null
          id?: string
          jenis_spm: Database["public"]["Enums"]["jenis_spm"]
          kegiatan_id?: string | null
          nilai_spm: number
          nomor_antrian?: string | null
          nomor_berkas?: string | null
          nomor_spm?: string | null
          opd_id: string
          pin_verified_at?: string | null
          program_id?: string | null
          status?: Database["public"]["Enums"]["status_spm"] | null
          subkegiatan_id?: string | null
          tanggal_ajuan?: string | null
          tanggal_akuntansi?: string | null
          tanggal_disetujui?: string | null
          tanggal_kepala_bkad?: string | null
          tanggal_pbmd?: string | null
          tanggal_perbendaharaan?: string | null
          tanggal_resepsionis?: string | null
          updated_at?: string | null
          uraian?: string | null
          vendor_id?: string | null
          verified_by_kepala_bkad?: string | null
        }
        Update: {
          bendahara_id?: string
          catatan_akuntansi?: string | null
          catatan_kepala_bkad?: string | null
          catatan_pbmd?: string | null
          catatan_perbendaharaan?: string | null
          catatan_resepsionis?: string | null
          created_at?: string | null
          id?: string
          jenis_spm?: Database["public"]["Enums"]["jenis_spm"]
          kegiatan_id?: string | null
          nilai_spm?: number
          nomor_antrian?: string | null
          nomor_berkas?: string | null
          nomor_spm?: string | null
          opd_id?: string
          pin_verified_at?: string | null
          program_id?: string | null
          status?: Database["public"]["Enums"]["status_spm"] | null
          subkegiatan_id?: string | null
          tanggal_ajuan?: string | null
          tanggal_akuntansi?: string | null
          tanggal_disetujui?: string | null
          tanggal_kepala_bkad?: string | null
          tanggal_pbmd?: string | null
          tanggal_perbendaharaan?: string | null
          tanggal_resepsionis?: string | null
          updated_at?: string | null
          uraian?: string | null
          vendor_id?: string | null
          verified_by_kepala_bkad?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spm_kegiatan_id_fkey"
            columns: ["kegiatan_id"]
            isOneToOne: false
            referencedRelation: "kegiatan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spm_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spm_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "program"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spm_subkegiatan_id_fkey"
            columns: ["subkegiatan_id"]
            isOneToOne: false
            referencedRelation: "subkegiatan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spm_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor"
            referencedColumns: ["id"]
          },
        ]
      }
      subkegiatan: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          kegiatan_id: string
          kode_subkegiatan: string
          nama_subkegiatan: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kegiatan_id: string
          kode_subkegiatan: string
          nama_subkegiatan: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kegiatan_id?: string
          kode_subkegiatan?: string
          nama_subkegiatan?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subkegiatan_kegiatan_id_fkey"
            columns: ["kegiatan_id"]
            isOneToOne: false
            referencedRelation: "kegiatan"
            referencedColumns: ["id"]
          },
        ]
      }
      template_surat: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          jenis_surat: string
          konten_html: string
          nama_template: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jenis_surat: string
          konten_html: string
          nama_template: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          jenis_surat?: string
          konten_html?: string
          nama_template?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          opd_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          opd_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          opd_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor: {
        Row: {
          alamat: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          nama_bank: string | null
          nama_rekening: string | null
          nama_vendor: string
          nomor_rekening: string | null
          npwp: string | null
          telepon: string | null
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          nama_bank?: string | null
          nama_rekening?: string | null
          nama_vendor: string
          nomor_rekening?: string | null
          npwp?: string | null
          telepon?: string | null
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          nama_bank?: string | null
          nama_rekening?: string | null
          nama_vendor?: string
          nomor_rekening?: string | null
          npwp?: string | null
          telepon?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wa_gateway: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_test_at: string | null
          sender_id: string
          test_status: string | null
          updated_at: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_test_at?: string | null
          sender_id: string
          test_status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_test_at?: string | null
          sender_id?: string
          test_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "administrator"
        | "bendahara_opd"
        | "resepsionis"
        | "pbmd"
        | "akuntansi"
        | "perbendaharaan"
        | "kepala_bkad"
        | "kuasa_bud"
        | "publik"
      jenis_lampiran: "spm" | "tbk" | "spj" | "kwitansi" | "kontrak" | "lainnya"
      jenis_notifikasi:
        | "spm_diajukan"
        | "spm_disetujui"
        | "spm_ditolak"
        | "spm_perlu_revisi"
        | "sp2d_diterbitkan"
        | "verifikasi_pin"
        | "verifikasi_otp"
      jenis_spm:
        | "UP"
        | "GU"
        | "TU"
        | "LS_Gaji"
        | "LS_Barang_Jasa"
        | "LS_Belanja_Modal"
      status_sp2d: "pending" | "diproses" | "diterbitkan" | "cair" | "gagal"
      status_spm:
        | "draft"
        | "diajukan"
        | "resepsionis_verifikasi"
        | "pbmd_verifikasi"
        | "akuntansi_validasi"
        | "perbendaharaan_verifikasi"
        | "kepala_bkad_review"
        | "disetujui"
        | "ditolak"
        | "perlu_revisi"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "administrator",
        "bendahara_opd",
        "resepsionis",
        "pbmd",
        "akuntansi",
        "perbendaharaan",
        "kepala_bkad",
        "kuasa_bud",
        "publik",
      ],
      jenis_lampiran: ["spm", "tbk", "spj", "kwitansi", "kontrak", "lainnya"],
      jenis_notifikasi: [
        "spm_diajukan",
        "spm_disetujui",
        "spm_ditolak",
        "spm_perlu_revisi",
        "sp2d_diterbitkan",
        "verifikasi_pin",
        "verifikasi_otp",
      ],
      jenis_spm: [
        "UP",
        "GU",
        "TU",
        "LS_Gaji",
        "LS_Barang_Jasa",
        "LS_Belanja_Modal",
      ],
      status_sp2d: ["pending", "diproses", "diterbitkan", "cair", "gagal"],
      status_spm: [
        "draft",
        "diajukan",
        "resepsionis_verifikasi",
        "pbmd_verifikasi",
        "akuntansi_validasi",
        "perbendaharaan_verifikasi",
        "kepala_bkad_review",
        "disetujui",
        "ditolak",
        "perlu_revisi",
      ],
    },
  },
} as const
