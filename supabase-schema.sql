-- SQL Script per creare la tabella api_keys in Supabase
-- Vai su: https://app.supabase.com → Il tuo progetto → SQL Editor → New Query
-- Copia e incolla questo script, poi clicca su "Run"

-- Crea la tabella api_keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'dev',
  usage INTEGER NOT NULL DEFAULT 0,
  monthly_limit INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Se la tabella esiste già, aggiungi le colonne mancanti (migrazione)
DO $$ 
BEGIN
  -- Aggiungi colonna type se non esiste
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'api_keys' AND column_name = 'type') THEN
    ALTER TABLE api_keys ADD COLUMN type TEXT NOT NULL DEFAULT 'dev';
  END IF;
  
  -- Aggiungi colonna usage se non esiste
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'api_keys' AND column_name = 'usage') THEN
    ALTER TABLE api_keys ADD COLUMN usage INTEGER NOT NULL DEFAULT 0;
  END IF;
  
  -- Aggiungi colonna monthly_limit se non esiste
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'api_keys' AND column_name = 'monthly_limit') THEN
    ALTER TABLE api_keys ADD COLUMN monthly_limit INTEGER NOT NULL DEFAULT 1000;
  END IF;
END $$;

-- Crea un indice per migliorare le performance delle query
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at);

-- Abilita Row Level Security (RLS) per sicurezza
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Crea una policy per permettere le operazioni CRUD (per ora permettiamo tutto)
-- In produzione, dovresti restringere questo basandoti sugli utenti autenticati
CREATE POLICY "Allow all operations on api_keys"
  ON api_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Se vuoi una policy più sicura (solo lettura pubblica, scrittura solo per utenti autenticati):
-- CREATE POLICY "Anyone can read api_keys"
--   ON api_keys
--   FOR SELECT
--   USING (true);
--
-- CREATE POLICY "Only authenticated users can modify api_keys"
--   ON api_keys
--   FOR ALL
--   USING (auth.role() = 'authenticated')
--   WITH CHECK (auth.role() = 'authenticated');

