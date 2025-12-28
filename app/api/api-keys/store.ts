// Data store for API keys using Supabase
import { supabase } from '@/lib/supabase';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  type: string;
  usage: number;
  monthlyLimit: number;
  createdAt: string;
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
  };
}

// Get all API keys from Supabase
export async function getAllKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching API keys:', error);
    throw new Error(`Failed to fetch API keys: ${error.message}`);
  }

  return data ? data.map(rowToApiKey) : [];
}

// Create a new API key in Supabase
export async function createKey(name: string, type: string = 'dev', monthlyLimit: number = 1000): Promise<ApiKey> {
  const apiKey = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  const newKey: Omit<ApiKeyRow, 'id' | 'created_at'> = {
    name,
    key: apiKey,
    type: type || 'dev',
    usage: 0,
    monthly_limit: monthlyLimit || 1000,
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
export async function updateKey(id: string, name: string, monthlyLimit?: number): Promise<ApiKey | null> {
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
export async function deleteKey(id: string): Promise<boolean> {
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
export async function verifyApiKey(apiKey: string): Promise<{ valid: boolean; key?: ApiKey; message: string }> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('key', apiKey)
    .single();

  if (error || !data) {
    return {
      valid: false,
      message: 'API key non valida o non trovata',
    };
  }

  const key = rowToApiKey(data);
  
  // Check if the key has remaining credit
  if (key.usage >= key.monthlyLimit) {
    return {
      valid: false,
      key,
      message: `API key valida ma esaurita. Consumo: ${key.usage}/${key.monthlyLimit}`,
    };
  }

  return {
    valid: true,
    key,
    message: `API key valida. Consumo: ${key.usage}/${key.monthlyLimit}`,
  };
}

// Increment the usage counter for an API key (atomic operation)
export async function incrementApiKeyUsage(apiKey: string): Promise<boolean> {
  try {
    // Use Supabase RPC for atomic increment, or fallback to update
    // First, try to get the current key to verify it exists
    const { data: keyData, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, usage')
      .eq('key', apiKey)
      .single();

    if (fetchError || !keyData) {
      console.error('Error fetching API key for increment:', fetchError);
      return false;
    }

    // Atomic increment using Supabase update
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ usage: keyData.usage + 1 })
      .eq('key', apiKey);

    if (updateError) {
      console.error('Error incrementing API key usage:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error incrementing API key usage:', error);
    return false;
  }
}

