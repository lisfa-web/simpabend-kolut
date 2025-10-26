-- Dashboard Performance Optimization: Add indexes untuk query yang sering digunakan

-- Index untuk SPM table - meningkatkan performa query berdasarkan status
CREATE INDEX IF NOT EXISTS idx_spm_status ON spm(status);

-- Index untuk SPM table - query berdasarkan OPD dan status
CREATE INDEX IF NOT EXISTS idx_spm_opd_status ON spm(opd_id, status);

-- Index untuk SPM table - query berdasarkan tanggal ajuan (untuk trend analysis)
CREATE INDEX IF NOT EXISTS idx_spm_tanggal_ajuan ON spm(tanggal_ajuan DESC);

-- Index untuk SPM table - query berdasarkan bendahara
CREATE INDEX IF NOT EXISTS idx_spm_bendahara_status ON spm(bendahara_id, status);

-- Index untuk SPM table - query berdasarkan vendor
CREATE INDEX IF NOT EXISTS idx_spm_vendor ON spm(vendor_id) WHERE vendor_id IS NOT NULL;

-- Index untuk SPM table - query berdasarkan updated_at (untuk stuck SPM detection)
CREATE INDEX IF NOT EXISTS idx_spm_updated_at ON spm(updated_at DESC);

-- Index untuk SP2D table - query berdasarkan status
CREATE INDEX IF NOT EXISTS idx_sp2d_status ON sp2d(status);

-- Index untuk SP2D table - query berdasarkan tanggal
CREATE INDEX IF NOT EXISTS idx_sp2d_created_at ON sp2d(created_at DESC);

-- Index untuk notifications table - user notifications query
CREATE INDEX IF NOT EXISTS idx_notifikasi_user_read ON notifikasi(user_id, is_read);

-- Index untuk audit_log table - admin audit queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

COMMENT ON INDEX idx_spm_status IS 'Optimizes dashboard queries filtering by SPM status';
COMMENT ON INDEX idx_spm_opd_status IS 'Optimizes OPD breakdown and filtering queries';
COMMENT ON INDEX idx_spm_tanggal_ajuan IS 'Optimizes monthly trend and date range queries';
COMMENT ON INDEX idx_sp2d_status IS 'Optimizes SP2D dashboard queries by status';