import { createClient } from '@supabase/supabase-js';

// Reemplaza estas dos cadenas con los datos reales que copiaste en el Paso 3
const SUPABASE_URL = "https://eiwvmymrslzcpfdthjwc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_G46711vQzRsYfHNcdQPLrQ_lkGmK5Ne";



export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);