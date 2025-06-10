import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qmebdqbcbzwyltrdfsnq.supabase.co'; // 自分のURL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZWJkcWJjYnp3eWx0cmRmc25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDMwMjgsImV4cCI6MjA2NTAxOTAyOH0.76kHsrg5zQ3NXCUeoMlIt2OAza1237uL4_ZuYc1GD9Y';         // Supabaseの公開APIキー

export const supabase = createClient(supabaseUrl, supabaseAnonKey);