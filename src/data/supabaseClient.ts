import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Trim trailing rest path if accidentally copied
const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');

export const supabase = createClient(cleanUrl, supabaseAnonKey);
