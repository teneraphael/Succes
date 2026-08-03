import { createClient } from '@supabase/supabase-js';

// Remplace par tes vraies clés Supabase (disponibles dans ton dashboard Supabase)
const SUPABASE_URL = 'https://bdvksesmeppwtzeofudv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkdmtzZXNtZXBwd3R6ZW9mdWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDIxMTUsImV4cCI6MjA3NjIxODExNX0.4msjOlpZ1vqAhA3vQG0zrcxbluUp3AnhwNS_nPglLLs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);