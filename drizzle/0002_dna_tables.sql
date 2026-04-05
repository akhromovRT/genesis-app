CREATE TABLE IF NOT EXISTS dna_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lab TEXT NOT NULL DEFAULT 'cerbalab',
  patient_name TEXT NOT NULL,
  birth_date TEXT,
  sex TEXT,
  sample_type TEXT,
  sample_number TEXT,
  sample_date TEXT,
  result_date TEXT,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INT,
  full_text TEXT,
  markers_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dna_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES dna_reports(id) ON DELETE CASCADE,
  position INT NOT NULL,
  gene TEXT NOT NULL,
  rsid TEXT NOT NULL DEFAULT '',
  genotype TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dna_reports_user_id ON dna_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_dna_markers_report_id ON dna_markers(report_id);
CREATE INDEX IF NOT EXISTS idx_dna_markers_gene ON dna_markers(gene);
CREATE INDEX IF NOT EXISTS idx_dna_markers_rsid ON dna_markers(rsid);
