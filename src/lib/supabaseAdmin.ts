import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  'https://sdtrbykacksainzahatd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkdHJieWthY2tzYWluemFoYXRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMzExMiwiZXhwIjoyMDc0Nzk5MTEyfQ.XdeRzZvqN3jFUbn7csMLR-JxpLsUTvu8g1uUpwMRHBY' 
);
