import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://aysucntiklrymddmzuuq.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5c3VjbnRpa2xyeW1kZG16dXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMjcyMDIsImV4cCI6MjA5MTcwMzIwMn0.sNbXvL8Nls3P9XJ9DB2K9wiw_VZkcr0FwdjStPmKBNE"

export const supabase = createClient(supabaseUrl, supabaseKey)