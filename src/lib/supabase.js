import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gnoweqobplxdcovvvsvl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdub3dlcW9icGx4ZGNvdnZ2c3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDY5NDEsImV4cCI6MjA3NDE4Mjk0MX0.yDfj7dK66bQanhR8shrQDICwkMl9h7oYlNKNwL7aBxQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)