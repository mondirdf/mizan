import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://voqhuievpxdygxpdijxp.supabase.co";
const ANON_KEY = "sb_publishable_Q0SMRph_L548lQd1nO9PMg_UQzl5UDK";

export const supabase = createClient(SUPABASE_URL, ANON_KEY);
