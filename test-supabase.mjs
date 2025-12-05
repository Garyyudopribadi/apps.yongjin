import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://phzyooddlafqozryxcqa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoenlvb2RkbGFmcW96cnl4Y3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTU4OTAsImV4cCI6MjA3NzYzMTg5MH0.CnwT-b-t4kxjFfbAjogb7dTFIAgkwdgPHgrB3QCmsc0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing Supabase connection...')

  try {
    // Test select specific NIK
    const { data, error } = await supabase
      .from('survey_kantin_yongjinone')
      .select('*')
      .eq('nik', 'YJ1_015126')

    if (error) {
      console.error('Error fetching data:', error)
    } else {
      console.log('Found record for NIK YJ1_015126:', data)
      console.log('Number of records:', data?.length || 0)
    }

    // Also check KTP
    const { data: dataKtp, error: errorKtp } = await supabase
      .from('survey_kantin_yongjinone')
      .select('*')
      .eq('ktp', 'YJ1_015126')

    if (errorKtp) {
      console.error('Error fetching KTP data:', errorKtp)
    } else {
      console.log('Found record for KTP YJ1_015126:', dataKtp)
      console.log('Number of KTP records:', dataKtp?.length || 0)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testConnection()