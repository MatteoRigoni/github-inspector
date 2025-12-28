# Guida alla Configurazione di Supabase

Questa guida ti aiuterà a configurare Supabase per il tuo progetto.

## 📋 Prerequisiti

- Hai già creato un progetto Supabase
- Hai l'URL del progetto
- Hai l'API key (anon/public key)

## 🔧 Passo 1: Configurare le Variabili d'Ambiente

1. Crea un file `.env.local` nella root del progetto `github-inspector/`

2. Aggiungi le seguenti variabili:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=il-tuo-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=la-tua-anon-key
```

### Come trovare queste informazioni:

1. Vai su https://app.supabase.com
2. Seleziona il tuo progetto
3. Vai su **Settings** (impostazioni) → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Esempio:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODIwOTYwMCwiZXhwIjoxOTUzNzg1NjAwfQ.EXAMPLE_KEY
```

## 🗄️ Passo 2: Creare la Tabella nel Database

1. Vai su https://app.supabase.com → Il tuo progetto
2. Apri **SQL Editor** (nel menu laterale)
3. Clicca su **New Query**
4. Copia e incolla il contenuto del file `supabase-schema.sql`
5. Clicca su **Run** (o premi `Ctrl+Enter` / `Cmd+Enter`)

La tabella `api_keys` verrà creata con:
- `id` (UUID, primary key)
- `name` (TEXT)
- `key` (TEXT)
- `created_at` (TIMESTAMP)

## ✅ Passo 3: Verificare la Configurazione

1. Riavvia il server di sviluppo:
   ```bash
   npm run dev
   ```

2. Vai su http://localhost:3000/dashboards

3. Prova a creare una nuova API key

4. Verifica che i dati appaiano nella tabella Supabase:
   - Vai su **Table Editor** in Supabase
   - Seleziona la tabella `api_keys`
   - Dovresti vedere i dati che hai creato

## 🔒 Sicurezza (Opzionale ma Consigliato)

Il file SQL fornito include una policy Row Level Security (RLS) molto permissiva che permette tutte le operazioni.

Per un ambiente di produzione, dovresti:
1. Implementare l'autenticazione utenti
2. Modificare le policy RLS per permettere operazioni solo agli utenti autenticati
3. Vedere il commento nel file `supabase-schema.sql` per un esempio di policy più sicura

## 🐛 Troubleshooting

### Errore: "Missing Supabase environment variables"
- Verifica che il file `.env.local` esista nella cartella `github-inspector/`
- Verifica che le variabili inizino con `NEXT_PUBLIC_`
- Riavvia il server di sviluppo dopo aver modificato `.env.local`

### Errore: "relation 'api_keys' does not exist"
- Verifica di aver eseguito lo script SQL in Supabase
- Controlla che la tabella sia stata creata nel Table Editor

### Errore: "new row violates row-level security policy"
- Verifica che le policy RLS siano state create correttamente
- Controlla il file SQL per assicurarti che la policy "Allow all operations" sia attiva

## 📚 Risorse

- [Documentazione Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

