import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uuqfzjycgxxatntagqpb.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kYmdibHBzZHRvbmxtdnhxZnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTE3OTQsImV4cCI6MjA5NTM4Nzc5NH0.OHUjdtQ1fiHAOuuYuLeaA1sBeGEkDpD_8S1P1t4Eb7I'

export const supabase = 
createClient(  supabaseUrl,supabaseKey)