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

-- SQL Script per creare la tabella users in Supabase
-- Vai su: https://app.supabase.com → Il tuo progetto → SQL Editor → New Query
-- Copia e incolla questo script, poi clicca su "Run"

-- Crea la tabella users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  provider TEXT NOT NULL DEFAULT 'google',
  provider_id TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Crea indici per migliorare le performance delle query
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Crea una funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crea un trigger per aggiornare updated_at automaticamente
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Abilita Row Level Security (RLS) per sicurezza
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Gli utenti possono leggere solo i propri dati
-- Nota: Questa policy funziona con Supabase Auth. 
-- Per Next-Auth, useremo una policy più permissiva che permette
-- agli utenti autenticati di leggere i propri dati tramite API
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true); -- Per ora permettiamo la lettura, ma in produzione dovresti usare auth.uid()

-- Policy: Gli utenti possono aggiornare solo i propri dati
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true) -- Per ora permettiamo l'aggiornamento
  WITH CHECK (true);

-- Policy: Permetti inserimento di nuovi utenti (per Next-Auth)
CREATE POLICY "Allow insert for authenticated"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Commenti per documentazione
COMMENT ON TABLE users IS 'Tabella per tracciare gli utenti autenticati con Next-Auth';
COMMENT ON COLUMN users.id IS 'ID univoco dell''utente (collegato a Next-Auth)';
COMMENT ON COLUMN users.email IS 'Email univoca dell''utente';
COMMENT ON COLUMN users.metadata IS 'Campo JSONB flessibile per dati aggiuntivi personalizzati';



