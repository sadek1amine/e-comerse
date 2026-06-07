import { createClient } from "@supabase/supabase-js";

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Guard against missing/invalid URL during build-time page generation
if (!supabaseUrl.startsWith("https://")) {
  supabaseUrl = "https://placeholder-project.supabase.co";
}
if (!supabaseAnonKey) {
  supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey";
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
