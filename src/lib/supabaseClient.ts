import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yopsdfwjppbawzsbrorr.supabase.co';
const supabaseAnonKey = 'sb_publishable_rMEdGyz27ApTySsGdRcgrw_5wD-xWw-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
