// js/supabaseClient.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';
import { SUPABASE_CONFIG } from './config.js'; 

/* ====== Supabase Client Initialization (Only once) ====== */
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);