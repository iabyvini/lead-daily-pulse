// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lyyjftynhihgmyjrhthj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5eWpmdHluaGloZ215anJodGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NzUwMzIsImV4cCI6MjA2NDU1MTAzMn0._ZRG9L4Ds9TBooP6iQnumtVqG8Rj-lp-LnUqO3O1OCc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);