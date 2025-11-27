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
      arsip_sp2d: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          bendahara_id: string
          created_at: string | null
          id: string
          nilai_diterima: number | null
          nilai_sp2d: number
          nomor_sp2d: string
          opd_id: string
          snapshot_data: Json
          sp2d_id: string
          spm_id: string
          status: string
          tanggal_sp2d: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          bendahara_id: string
          created_at?: string | null
          id?: string
          nilai_diterima?: number | null
          nilai_sp2d: number
          nomor_sp2d: string
          opd_id: string
          snapshot_data: Json
          sp2d_id: string
          spm_id: string
          status: string
          tanggal_sp2d: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          bendahara_id?: string
          created_at?: string | null
          id?: string
          nilai_diterima?: number | null
          nilai_sp2d?: number
          nomor_sp2d?: string
          opd_id?: string
          snapshot_data?: Json
          sp2d_id?: string
          spm_id?: string
          status?: string
          tanggal_sp2d?: string
        }
        Relationships: [
          {
            foreignKeyName: "arsip_sp2d_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arsip_sp2d_bendahara_id_fkey"
            columns: ["bendahara_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arsip_sp2d_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arsip_sp2d_sp2d_id_fkey"
            columns: ["sp2d_id"]
            isOneToOne: false
            referencedRelation: "sp2d"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arsip_sp2d_spm_id_fkey"
            columns: ["spm_id"]
            isOneToOne: false
            referencedRelation: "spm"
            referencedColumns: ["id"]
          },
        ]
      }
      arsip_spm: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          bendahara_id: string
          created_at: string | null
          id: string
          nama_penerima: string | null
          nilai_bersih: number | null
          nilai_spm: number
          nomor_spm: string
          opd_id: string
          snapshot_data: Json
          spm_id: string
          status: string
          tanggal_spm: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          bendahara_id: string
          created_at?: string | null
          id?: string
          nama_penerima?: string | null
          nilai_bersih?: number | null
          nilai_spm: number
          nomor_spm: string
          opd_id: string
          snapshot_data: Json
          spm_id: string
          status: string
          tanggal_spm: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          bendahara_id?: string
          created_at?: string | null
          id?: string
          nama_penerima?: string | null
          nilai_bersih?: number | null
          nilai_spm?: number
          nomor_spm?: string
          opd_id?: string
          snapshot_data?: Json
          spm_id?: string
          status?: string
          tanggal_spm?: string
        }
        Relationships: [
          {
            foreignKeyName: "arsip_spm_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arsip_spm_bendahara_id_fkey"
            columns: ["bendahara_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arsip_spm_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arsip_spm_spm_id_fkey"
            columns: ["spm_id"]
            isOneToOne: false
            referencedRelation: "spm"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          emergency_reason: string | null
          id: string
          ip_address: unknown
          is_emergency: boolean | null
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
          emergency_reason?: string | null
          id?: string
          ip_address?: unknown
          is_emergency?: boolean | null
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
          emergency_reason?: string | null
          id?: string
          ip_address?: unknown
          is_emergency?: boolean | null
          new_data?: Json | null
          old_data?: Json | null
          resource?: string
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      dashboard_layout: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          layout_config: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          layout_config: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          layout_config?: Json
          updated_at?: string
          user_id?: string
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
      jenis_spm: {
        Row: {
          ada_pajak: boolean | null
          created_at: string | null
          deskripsi: string | null
          id: string
          is_active: boolean | null
          nama_jenis: string
          updated_at: string | null
        }
        Insert: {
          ada_pajak?: boolean | null
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          is_active?: boolean | null
          nama_jenis: string
          updated_at?: string | null
        }
        Update: {
          ada_pajak?: boolean | null
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          is_active?: boolean | null
          nama_jenis?: string
          updated_at?: string | null
        }
        Relationships: []
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
      master_bank: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          kode_bank: string
          nama_bank: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kode_bank: string
          nama_bank: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kode_bank?: string
          nama_bank?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      master_pajak: {
        Row: {
          created_at: string | null
          deskripsi: string | null
          id: string
          is_active: boolean | null
          jenis_pajak: string
          kategori: string | null
          kode_pajak: string
          nama_pajak: string
          rekening_pajak: string
          tarif_default: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          is_active?: boolean | null
          jenis_pajak: string
          kategori?: string | null
          kode_pajak: string
          nama_pajak: string
          rekening_pajak: string
          tarif_default: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          is_active?: boolean | null
          jenis_pajak?: string
          kategori?: string | null
          kode_pajak?: string
          nama_pajak?: string
          rekening_pajak?: string
          tarif_default?: number
          updated_at?: string | null
        }
        Relationships: []
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
          bank_id: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          kode_opd: string
          nama_bendahara: string | null
          nama_opd: string
          nomor_rekening_bendahara: string | null
          telepon: string | null
          updated_at: string | null
        }
        Insert: {
          alamat?: string | null
          bank_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          kode_opd: string
          nama_bendahara?: string | null
          nama_opd: string
          nomor_rekening_bendahara?: string | null
          telepon?: string | null
          updated_at?: string | null
        }
        Update: {
          alamat?: string | null
          bank_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          kode_opd?: string
          nama_bendahara?: string | null
          nama_opd?: string
          nomor_rekening_bendahara?: string | null
          telepon?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opd_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "master_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      pajak_per_jenis_spm: {
        Row: {
          created_at: string | null
          deskripsi: string | null
          id: string
          is_default: boolean | null
          jenis_spm: string
          master_pajak_id: string
          updated_at: string | null
          uraian_template: string | null
          urutan: number | null
        }
        Insert: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          is_default?: boolean | null
          jenis_spm: string
          master_pajak_id: string
          updated_at?: string | null
          uraian_template?: string | null
          urutan?: number | null
        }
        Update: {
          created_at?: string | null
          deskripsi?: string | null
          id?: string
          is_default?: boolean | null
          jenis_spm?: string
          master_pajak_id?: string
          updated_at?: string | null
          uraian_template?: string | null
          urutan?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pajak_per_jenis_spm_master_pajak_id_fkey"
            columns: ["master_pajak_id"]
            isOneToOne: false
            referencedRelation: "master_pajak"
            referencedColumns: ["id"]
          },
        ]
      }
      panduan_manual: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          judul: string
          konten: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          updated_by: string | null
          urutan: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          judul: string
          konten: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          updated_by?: string | null
          urutan?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          judul?: string
          konten?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          updated_by?: string | null
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "panduan_manual_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panduan_manual_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      pihak_ketiga: {
        Row: {
          alamat: string | null
          bank_id: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          nama_bank: string | null
          nama_pihak_ketiga: string
          nama_rekening: string | null
          nomor_rekening: string | null
          npwp: string | null
          telepon: string | null
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          bank_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          nama_bank?: string | null
          nama_pihak_ketiga: string
          nama_rekening?: string | null
          nomor_rekening?: string | null
          npwp?: string | null
          telepon?: string | null
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          bank_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          nama_bank?: string | null
          nama_pihak_ketiga?: string
          nama_rekening?: string | null
          nomor_rekening?: string | null
          npwp?: string | null
          telepon?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pihak_ketiga_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "master_bank"
            referencedColumns: ["id"]
          },
        ]
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
      potongan_pajak_sp2d: {
        Row: {
          created_at: string | null
          dasar_pengenaan: number
          id: string
          jenis_pajak: Database["public"]["Enums"]["jenis_pajak"]
          jumlah_pajak: number
          rekening_pajak: string | null
          sp2d_id: string
          tarif: number
          updated_at: string | null
          uraian: string
        }
        Insert: {
          created_at?: string | null
          dasar_pengenaan: number
          id?: string
          jenis_pajak: Database["public"]["Enums"]["jenis_pajak"]
          jumlah_pajak: number
          rekening_pajak?: string | null
          sp2d_id: string
          tarif: number
          updated_at?: string | null
          uraian: string
        }
        Update: {
          created_at?: string | null
          dasar_pengenaan?: number
          id?: string
          jenis_pajak?: Database["public"]["Enums"]["jenis_pajak"]
          jumlah_pajak?: number
          rekening_pajak?: string | null
          sp2d_id?: string
          tarif?: number
          updated_at?: string | null
          uraian?: string
        }
        Relationships: [
          {
            foreignKeyName: "potongan_pajak_sp2d_sp2d_id_fkey"
            columns: ["sp2d_id"]
            isOneToOne: false
            referencedRelation: "sp2d"
            referencedColumns: ["id"]
          },
        ]
      }
      potongan_pajak_spm: {
        Row: {
          created_at: string | null
          dasar_pengenaan: number
          id: string
          jenis_pajak: string
          jumlah_pajak: number
          rekening_pajak: string | null
          spm_id: string
          tarif: number
          updated_at: string | null
          uraian: string
        }
        Insert: {
          created_at?: string | null
          dasar_pengenaan: number
          id?: string
          jenis_pajak: string
          jumlah_pajak: number
          rekening_pajak?: string | null
          spm_id: string
          tarif: number
          updated_at?: string | null
          uraian: string
        }
        Update: {
          created_at?: string | null
          dasar_pengenaan?: number
          id?: string
          jenis_pajak?: string
          jumlah_pajak?: number
          rekening_pajak?: string | null
          spm_id?: string
          tarif?: number
          updated_at?: string | null
          uraian?: string
        }
        Relationships: [
          {
            foreignKeyName: "potongan_pajak_spm_spm_id_fkey"
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
          spm_id: string
        }
        Insert: {
          catatan_revisi: string
          created_at?: string | null
          id?: string
          revisi_by: string
          spm_id: string
        }
        Update: {
          catatan_revisi?: string
          created_at?: string | null
          id?: string
          revisi_by?: string
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
      setting_access_control: {
        Row: {
          created_at: string | null
          id: string
          is_configurable: boolean | null
          setting_key: string
          setting_title: string
          superadmin_only: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_configurable?: boolean | null
          setting_key: string
          setting_title: string
          superadmin_only?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_configurable?: boolean | null
          setting_key?: string
          setting_title?: string
          superadmin_only?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sp2d: {
        Row: {
          catatan: string | null
          created_at: string | null
          created_by: string | null
          dokumen_sp2d_url: string | null
          id: string
          kuasa_bud_id: string | null
          nama_bank: string | null
          nama_rekening: string | null
          nilai_diterima: number | null
          nilai_sp2d: number
          nomor_penguji: string | null
          nomor_referensi_bank: string | null
          nomor_rekening: string | null
          nomor_sp2d: string
          otp_verified_at: string | null
          spm_id: string
          status: Database["public"]["Enums"]["status_sp2d"] | null
          tanggal_cair: string | null
          tanggal_kirim_bank: string | null
          tanggal_konfirmasi_bank: string | null
          tanggal_sp2d: string | null
          total_potongan: number | null
          ttd_digital_url: string | null
          updated_at: string | null
          verified_by: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string | null
          created_by?: string | null
          dokumen_sp2d_url?: string | null
          id?: string
          kuasa_bud_id?: string | null
          nama_bank?: string | null
          nama_rekening?: string | null
          nilai_diterima?: number | null
          nilai_sp2d: number
          nomor_penguji?: string | null
          nomor_referensi_bank?: string | null
          nomor_rekening?: string | null
          nomor_sp2d: string
          otp_verified_at?: string | null
          spm_id: string
          status?: Database["public"]["Enums"]["status_sp2d"] | null
          tanggal_cair?: string | null
          tanggal_kirim_bank?: string | null
          tanggal_konfirmasi_bank?: string | null
          tanggal_sp2d?: string | null
          total_potongan?: number | null
          ttd_digital_url?: string | null
          updated_at?: string | null
          verified_by?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string | null
          created_by?: string | null
          dokumen_sp2d_url?: string | null
          id?: string
          kuasa_bud_id?: string | null
          nama_bank?: string | null
          nama_rekening?: string | null
          nilai_diterima?: number | null
          nilai_sp2d?: number
          nomor_penguji?: string | null
          nomor_referensi_bank?: string | null
          nomor_rekening?: string | null
          nomor_sp2d?: string
          otp_verified_at?: string | null
          spm_id?: string
          status?: Database["public"]["Enums"]["status_sp2d"] | null
          tanggal_cair?: string | null
          tanggal_kirim_bank?: string | null
          tanggal_konfirmasi_bank?: string | null
          tanggal_sp2d?: string | null
          total_potongan?: number | null
          ttd_digital_url?: string | null
          updated_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sp2d_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sp2d_spm_id_fkey"
            columns: ["spm_id"]
            isOneToOne: false
            referencedRelation: "spm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sp2d_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          is_aset: boolean | null
          jenis_spm_id: string | null
          nama_bank: string | null
          nama_penerima: string | null
          nama_rekening: string | null
          nilai_bersih: number | null
          nilai_spm: number
          nomor_antrian: string | null
          nomor_berkas: string | null
          nomor_rekening: string | null
          nomor_spm: string | null
          opd_id: string
          pin_verified_at: string | null
          status: Database["public"]["Enums"]["status_spm"] | null
          tanggal_ajuan: string | null
          tanggal_akuntansi: string | null
          tanggal_disetujui: string | null
          tanggal_kepala_bkad: string | null
          tanggal_pbmd: string | null
          tanggal_perbendaharaan: string | null
          tanggal_resepsionis: string | null
          tipe_penerima: string | null
          total_potongan: number | null
          updated_at: string | null
          uraian: string | null
          verified_by_akuntansi: string | null
          verified_by_kepala_bkad: string | null
          verified_by_pbmd: string | null
          verified_by_perbendaharaan: string | null
          verified_by_resepsionis: string | null
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
          is_aset?: boolean | null
          jenis_spm_id?: string | null
          nama_bank?: string | null
          nama_penerima?: string | null
          nama_rekening?: string | null
          nilai_bersih?: number | null
          nilai_spm: number
          nomor_antrian?: string | null
          nomor_berkas?: string | null
          nomor_rekening?: string | null
          nomor_spm?: string | null
          opd_id: string
          pin_verified_at?: string | null
          status?: Database["public"]["Enums"]["status_spm"] | null
          tanggal_ajuan?: string | null
          tanggal_akuntansi?: string | null
          tanggal_disetujui?: string | null
          tanggal_kepala_bkad?: string | null
          tanggal_pbmd?: string | null
          tanggal_perbendaharaan?: string | null
          tanggal_resepsionis?: string | null
          tipe_penerima?: string | null
          total_potongan?: number | null
          updated_at?: string | null
          uraian?: string | null
          verified_by_akuntansi?: string | null
          verified_by_kepala_bkad?: string | null
          verified_by_pbmd?: string | null
          verified_by_perbendaharaan?: string | null
          verified_by_resepsionis?: string | null
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
          is_aset?: boolean | null
          jenis_spm_id?: string | null
          nama_bank?: string | null
          nama_penerima?: string | null
          nama_rekening?: string | null
          nilai_bersih?: number | null
          nilai_spm?: number
          nomor_antrian?: string | null
          nomor_berkas?: string | null
          nomor_rekening?: string | null
          nomor_spm?: string | null
          opd_id?: string
          pin_verified_at?: string | null
          status?: Database["public"]["Enums"]["status_spm"] | null
          tanggal_ajuan?: string | null
          tanggal_akuntansi?: string | null
          tanggal_disetujui?: string | null
          tanggal_kepala_bkad?: string | null
          tanggal_pbmd?: string | null
          tanggal_perbendaharaan?: string | null
          tanggal_resepsionis?: string | null
          tipe_penerima?: string | null
          total_potongan?: number | null
          updated_at?: string | null
          uraian?: string | null
          verified_by_akuntansi?: string | null
          verified_by_kepala_bkad?: string | null
          verified_by_pbmd?: string | null
          verified_by_perbendaharaan?: string | null
          verified_by_resepsionis?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spm_bendahara_id_fkey"
            columns: ["bendahara_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spm_jenis_spm_id_fkey"
            columns: ["jenis_spm_id"]
            isOneToOne: false
            referencedRelation: "jenis_spm"
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
            foreignKeyName: "spm_verified_by_akuntansi_fkey"
            columns: ["verified_by_akuntansi"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spm_verified_by_kepala_bkad_fkey"
            columns: ["verified_by_kepala_bkad"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spm_verified_by_pbmd_fkey"
            columns: ["verified_by_pbmd"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spm_verified_by_perbendaharaan_fkey"
            columns: ["verified_by_perbendaharaan"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spm_verified_by_resepsionis_fkey"
            columns: ["verified_by_resepsionis"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          kop_surat_url: string | null
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
          kop_surat_url?: string | null
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
          kop_surat_url?: string | null
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
          bank_id: string | null
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
          bank_id?: string | null
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
          bank_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "vendor_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "master_bank"
            referencedColumns: ["id"]
          },
        ]
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
      can_write: { Args: { _user_id: string }; Returns: boolean }
      check_jenis_spm_dependencies: {
        Args: { jenis_spm_id_param: string }
        Returns: Json
      }
      check_opd_dependencies: { Args: { opd_id_param: string }; Returns: Json }
      check_pajak_dependencies: {
        Args: { pajak_id_param: string }
        Returns: Json
      }
      check_vendor_dependencies: {
        Args: { vendor_id_param: string }
        Returns: Json
      }
      generate_document_number: {
        Args: { _jenis_dokumen: string; _tanggal?: string }
        Returns: string
      }
      get_database_schema: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_text: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      month_to_roman: { Args: { month_num: number }; Returns: string }
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
        | "super_admin"
        | "demo_admin"
      jenis_lampiran: "spm" | "tbk" | "spj" | "kwitansi" | "kontrak" | "lainnya"
      jenis_notifikasi:
        | "spm_diajukan"
        | "spm_disetujui"
        | "spm_ditolak"
        | "spm_perlu_revisi"
        | "sp2d_diterbitkan"
        | "verifikasi_pin"
        | "verifikasi_otp"
      jenis_pajak: "pph_21" | "pph_22" | "pph_23" | "pph_4_ayat_2" | "ppn"
      status_sp2d:
        | "pending"
        | "diproses"
        | "diterbitkan"
        | "diuji_bank"
        | "cair"
        | "gagal"
      status_spm:
        | "draft"
        | "diajukan"
        | "resepsionis_verifikasi"
        | "pbmd_verifikasi"
        | "akuntansi_validasi"
        | "perbendaharaan_verifikasi"
        | "kepala_bkad_review"
        | "disetujui"
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
        "super_admin",
        "demo_admin",
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
      jenis_pajak: ["pph_21", "pph_22", "pph_23", "pph_4_ayat_2", "ppn"],
      status_sp2d: [
        "pending",
        "diproses",
        "diterbitkan",
        "diuji_bank",
        "cair",
        "gagal",
      ],
      status_spm: [
        "draft",
        "diajukan",
        "resepsionis_verifikasi",
        "pbmd_verifikasi",
        "akuntansi_validasi",
        "perbendaharaan_verifikasi",
        "kepala_bkad_review",
        "disetujui",
        "perlu_revisi",
      ],
    },
  },
} as const
