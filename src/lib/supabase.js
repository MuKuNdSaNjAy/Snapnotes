import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn("Supabase env vars missing — falling back to localStorage");
}

export const supabase = url && key ? createClient(url, key) : null;
