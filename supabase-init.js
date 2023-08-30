import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const supabase = createClient(
  "https://goplyhlkngecdqwiwkfo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvcGx5aGxrbmdlY2Rxd2l3a2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTMyMDQ0NzEsImV4cCI6MjAwODc4MDQ3MX0.XU7uy0TLBorr3YSKlRTV11_buFfgVUppyfWp2cuQ9nA"
);

export { supabase }