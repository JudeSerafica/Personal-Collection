import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://sdtrbykacksainzahatd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdHJieWthY2tzYWluemFoYXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjMxMTIsImV4cCI6MjA3NDc5OTExMn0.G7rMA2gRUHzZjPDBJIgZ_UFIxN-_yvDPomHEpFZXQW4",
  {
    auth: {
      persistSession: true,   // ✅ para naka-save ang session kahit refresh
      autoRefreshToken: true, // ✅ auto-refresh ng session
      detectSessionInUrl: true,
    },
  }
);
