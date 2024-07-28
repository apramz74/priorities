import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://axtqicwluobjwubonlxd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4dHFpY3dsdW9iand1Ym9ubHhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE1ODIxOTUsImV4cCI6MjAzNzE1ODE5NX0.M3-zV3ufDiy_-n1C4WfjCIlC8ywxtXPxcHSTCByHeeg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
