import { createClient } from '@supabase/supabase-js';

const url = process.env['SUPABASE_URL'] ?? 'https://supabase.ago-dev.org';
const supabaseKey =
  process.env['SUPABASE_ACCESS_KEY'] ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UiLAogICAgImlhdCI6IDE2NTk3MzY4MDAsCiAgICAiZXhwIjogMTgxNzUwMzIwMAp9.ztQ6vNo64EzmcoVyf2S9Z4UoBbLzgL1Ht_rl7-pHjpM';
if (!url || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ACCESS_KEY');
}

const supabase = createClient(url, supabaseKey);

export default supabase;
