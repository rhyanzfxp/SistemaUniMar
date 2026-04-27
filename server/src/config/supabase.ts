import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'SUA_URL_AQUI') {
  console.warn('⚠️ Supabase URL or Key is missing in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
