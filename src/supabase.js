import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uuqfzjycgxxatntagqpb.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1cWZ6anljZ3h4YXRudGFncXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MTEyNjcsImV4cCI6MjA5NTM4NzI2N30.p4Mou5tAgXkCVU1QdcLhax5VjkJbM73CmKEv-VMU6gY'

export const supabase = createClient(  supabaseUrl,supabaseKey)