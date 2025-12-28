import { supabase } from './supabase';

// Plan limits configuration
export const PLAN_LIMITS = {
  free: 5,
  starter: 100,
  pro: 1000,
} as const;

/**
 * Get the maximum credits allowed for a plan
 */
export function getPlanLimit(plan: string): number {
  return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  provider: string;
  provider_id: string | null;
  last_login: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  plan: 'free' | 'starter' | 'pro';
  total_credits: number;
  used_credits: number;
  lifetime_used_credits: number;
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  provider: string;
  provider_id: string | null;
  last_login: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  plan: string;
  total_credits: number;
  used_credits: number;
  lifetime_used_credits: number;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
    provider: row.provider,
    provider_id: row.provider_id,
    last_login: row.last_login,
    login_count: row.login_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    metadata: row.metadata || {},
    plan: (row.plan || 'free') as 'free' | 'starter' | 'pro',
    total_credits: row.total_credits ?? 5,
    used_credits: row.used_credits ?? 0,
    lifetime_used_credits: row.lifetime_used_credits ?? 0,
  };
}

/**
 * Crea o aggiorna un utente in Supabase
 * Se l'utente esiste già (per email o id), viene aggiornato
 * Altrimenti viene creato un nuovo record
 */
export async function createOrUpdateUser(userData: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  provider?: string;
  provider_id?: string | null;
}): Promise<User> {
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userData.id)
    .single();

  const now = new Date().toISOString();
  const isNewUser = !existingUser;

  const updateData: Partial<UserRow> = {
    email: userData.email,
    name: userData.name ?? null,
    image: userData.image ?? null,
    provider: userData.provider || 'google',
    provider_id: userData.provider_id ?? null,
    last_login: now,
    updated_at: now,
  };

  if (isNewUser) {
    // Nuovo utente: crea record con piano free e 5 crediti
    updateData.id = userData.id;
    updateData.created_at = now;
    updateData.login_count = 1;
    updateData.metadata = {};
    updateData.plan = 'free';
    updateData.total_credits = 5;
    updateData.used_credits = 0;
    updateData.lifetime_used_credits = 0;

    const { data, error } = await supabase
      .from('users')
      .insert(updateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return rowToUser(data);
  } else {
    // Utente esistente: aggiorna e incrementa login_count
    updateData.login_count = (existingUser.login_count || 0) + 1;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return rowToUser(data);
  }
}

/**
 * Recupera un utente per ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Nessun record trovato
      return null;
    }
    console.error('Error fetching user:', error);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data ? rowToUser(data) : null;
}

/**
 * Recupera un utente per email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Nessun record trovato
      return null;
    }
    console.error('Error fetching user:', error);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data ? rowToUser(data) : null;
}

/**
 * Aggiorna i metadata di un utente
 * I metadata vengono fusi (merge) con quelli esistenti
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, any>
): Promise<User> {
  // Recupera i metadata esistenti
  const { data: user } = await supabase
    .from('users')
    .select('metadata')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  // Fonde i nuovi metadata con quelli esistenti
  const mergedMetadata = {
    ...(user.metadata || {}),
    ...metadata,
  };

  const { data, error } = await supabase
    .from('users')
    .update({
      metadata: mergedMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user metadata:', error);
    throw new Error(`Failed to update user metadata: ${error.message}`);
  }

  return rowToUser(data);
}

/**
 * Incrementa il contatore di login di un utente
 */
export async function incrementLoginCount(userId: string): Promise<User> {
  const { data: user } = await supabase
    .from('users')
    .select('login_count')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      login_count: (user.login_count || 0) + 1,
      last_login: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error incrementing login count:', error);
    throw new Error(`Failed to increment login count: ${error.message}`);
  }

  return rowToUser(data);
}

/**
 * Recupera tutti gli utenti (utile per admin/analytics)
 */
export async function getAllUsers(limit?: number): Promise<User[]> {
  let query = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data ? data.map(rowToUser) : [];
}

/**
 * Recupera statistiche utenti
 */
export async function getUserStats(): Promise<{
  total: number;
  active_last_30_days: number;
  new_this_month: number;
}> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalResult, activeResult, newResult] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('last_login', thirtyDaysAgo.toISOString()),
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString()),
  ]);

  return {
    total: totalResult.count || 0,
    active_last_30_days: activeResult.count || 0,
    new_this_month: newResult.count || 0,
  };
}

