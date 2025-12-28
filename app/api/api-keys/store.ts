// Data store for API keys using Supabase
import { supabase } from '@/lib/supabase';
import { getUserById, getPlanLimit } from '@/lib/users';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: string;
  usage: number;
  monthlyLimit: number;
  createdAt: string;
  userId?: string;
}

// Database interface (snake_case as per Supabase convention)
interface ApiKeyRow {
  id: string;
  name: string;
  key: string;
  type: string;
  usage: number;
  monthly_limit: number;
  created_at: string;
  user_id?: string;
}

// Convert database row to ApiKey interface
function rowToApiKey(row: ApiKeyRow): ApiKey {
  return {
    id: row.id,
    name: row.name,
    key: row.key,
    type: row.type,
    usage: row.usage ?? 0,
    monthlyLimit: row.monthly_limit ?? 1000,
    createdAt: row.created_at,
    userId: row.user_id,
  };
}

// Get all API keys from Supabase (optionally filtered by user_id)
export async function getAllKeys(userId?: string): Promise<ApiKey[]> {
  let query = supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  // Filtra per user_id se fornito
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching API keys:', error);
    throw new Error(`Failed to fetch API keys: ${error.message}`);
  }

  return data ? data.map(rowToApiKey) : [];
}

// Create a new API key in Supabase
export async function createKey(
  name: string, 
  type: string = 'dev', 
  monthlyLimit: number = 1000,
  userId?: string
): Promise<ApiKey> {
  if (!userId) {
    throw new Error('User ID is required to create an API key');
  }

  // 1. Recupera utente e verifica limite piano
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const planLimit = getPlanLimit(user.plan);

  // 2. Verifica che il limite API key non superi il limite piano
  if (monthlyLimit > planLimit) {
    throw new Error(
      `Il limite della API key (${monthlyLimit}) non può superare il limite del tuo piano (${planLimit}). ` +
      `Piano attuale: ${user.plan}`
    );
  }

  // 3. Verifica che ci siano abbastanza crediti disponibili
  const availableCredits = user.total_credits - user.used_credits;
  if (monthlyLimit > availableCredits) {
    throw new Error(
      `Crediti insufficienti. Disponibili: ${availableCredits}, Richiesti: ${monthlyLimit}`
    );
  }

  const apiKey = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  const newKey: Omit<ApiKeyRow, 'id' | 'created_at'> = {
    name,
    key: apiKey,
    type: type || 'dev',
    usage: 0,
    monthly_limit: monthlyLimit,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from('api_keys')
    .insert(newKey)
    .select()
    .single();

  if (error) {
    console.error('Error creating API key:', error);
    throw new Error(`Failed to create API key: ${error.message}`);
  }

  return rowToApiKey(data);
}

// Update an API key in Supabase
export async function updateKey(
  id: string, 
  name: string, 
  monthlyLimit?: number,
  userId?: string
): Promise<ApiKey | null> {
  // Verifica che la chiave appartenga all'utente se userId è fornito
  if (userId) {
    const { data: existingKey } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingKey) {
      return null;
    }

    if (existingKey.user_id !== userId) {
      throw new Error('Unauthorized: You can only update your own API keys');
    }
  }

  const updateData: Partial<Omit<ApiKeyRow, 'id' | 'key' | 'created_at' | 'type'>> = { name };
  
  if (monthlyLimit !== undefined) {
    updateData.monthly_limit = monthlyLimit;
  }

  const { data, error } = await supabase
    .from('api_keys')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating API key:', error);
    throw new Error(`Failed to update API key: ${error.message}`);
  }

  return data ? rowToApiKey(data) : null;
}

// Delete an API key from Supabase
// NOTE: This does NOT decrease user.used_credits to prevent quota abuse
export async function deleteKey(id: string, userId?: string): Promise<boolean> {
  // Verifica che la chiave appartenga all'utente se userId è fornito
  if (userId) {
    const { data: existingKey } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingKey) {
      throw new Error('API key not found');
    }

    if (existingKey.user_id !== userId) {
      throw new Error('Unauthorized: You can only delete your own API keys');
    }
  }

  // Elimina solo la chiave API - NON diminuire used_credits per prevenire abusi
  // L'utente non può "resettare" la quota cancellando chiavi usate
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting API key:', error);
    throw new Error(`Failed to delete API key: ${error.message}`);
  }

  return true;
}

// Verify an API key and check if it has remaining credit
export async function verifyApiKey(apiKey: string): Promise<{ 
  valid: boolean; 
  key?: ApiKey; 
  user?: any;
  message: string 
}> {
  // 1. Trova API key
  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', apiKey)
    .single();

  if (error || !keyData) {
    return {
      valid: false,
      message: 'API key non valida o non trovata',
    };
  }

  const key = rowToApiKey(keyData);

  if (!key.userId) {
    return {
      valid: false,
      message: 'API key non associata a un utente',
    };
  }

  // 2. Recupera dati utente
  const user = await getUserById(key.userId);
  if (!user) {
    return {
      valid: false,
      message: 'Utente non trovato per questa API key',
    };
  }

  const userData = {
    id: user.id,
    email: user.email,
    plan: user.plan,
    total_credits: user.total_credits,
    used_credits: user.used_credits,
    lifetime_used_credits: user.lifetime_used_credits,
  };

  // 3. Controlla limite API key individuale
  if (key.usage >= key.monthlyLimit) {
    return {
      valid: false,
      key,
      user: userData,
      message: `Limite API key raggiunto. Uso: ${key.usage}/${key.monthlyLimit}`,
    };
  }

  // 4. Controlla limite totale account
  if (user.used_credits >= user.total_credits) {
    return {
      valid: false,
      key,
      user: userData,
      message: `Limite account raggiunto. Uso totale: ${user.used_credits}/${user.total_credits}`,
    };
  }

  return {
    valid: true,
    key,
    user: userData,
    message: `API key valida. Uso key: ${key.usage}/${key.monthlyLimit}, Uso account: ${user.used_credits}/${user.total_credits}`,
  };
}

// Increment the usage counter for an API key (atomic operation)
export async function incrementApiKeyUsage(apiKey: string): Promise<boolean> {
  try {
    // 1. Verifica API key e ottieni user
    const verification = await verifyApiKey(apiKey);
    
    if (!verification.valid || !verification.key || !verification.user) {
      return false;
    }

    // 2. Incrementa uso API key
    const { error: keyError } = await supabase
      .from('api_keys')
      .update({ usage: verification.key.usage + 1 })
      .eq('key', apiKey);

    if (keyError) {
      console.error('Error incrementing API key usage:', keyError);
      return false;
    }

    // 3. Incrementa uso account e lifetime usage
    const { error: userError } = await supabase
      .from('users')
      .update({
        used_credits: verification.user.used_credits + 1,
        lifetime_used_credits: (verification.user.lifetime_used_credits || 0) + 1,
      })
      .eq('id', verification.user.id);

    if (userError) {
      console.error('Error incrementing user credits:', userError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error incrementing API key usage:', error);
    return false;
  }
}

