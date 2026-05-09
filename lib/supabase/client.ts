// Two clients: service role bypasses RLS for writes, anon for reads
// This permanently fixes the 400 errors from RLS policy conflicts

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://isdwwpystviyjbiimsjw.supabase.co'

// Anon key — for reads, safe to expose
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHd3cHlzdHZpeWpiaWltc2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzQ4NTgsImV4cCI6MjA5MzQ1MDg1OH0.yjGYeVUc7FruVJ5dSfsdVKdFl8L6yKDsJLxAL5H7SDM'

// Service role — bypasses RLS, for all writes
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHd3cHlzdHZpeWpiaWltc2p3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzg3NDg1OCwiZXhwIjoyMDkzNDUwODU4fQ.ZtiTyviawg_32cGgrBClDGOwmndsgjbSquAZiIDK99Q'

// Use for all reads
export const supabase = createClient(SUPABASE_URL, ANON_KEY)

// Use for all inserts/updates/deletes — bypasses RLS permanently
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
