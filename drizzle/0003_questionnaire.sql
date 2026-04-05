CREATE TABLE IF NOT EXISTS questionnaire_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  current_step INT NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  highlights JSONB,
  completed_at TIMESTAMPTZ,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_sessions_user_id ON questionnaire_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_sessions_token ON questionnaire_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_questionnaire_sessions_status ON questionnaire_sessions(status);

CREATE TRIGGER questionnaire_sessions_updated_at
  BEFORE UPDATE ON questionnaire_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
