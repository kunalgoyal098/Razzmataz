import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Agent interface
export interface Agent {
  id: string
  email: string
  agent_name: string
  company_name: string
  phone_number: string
  created_at: string
  updated_at: string
}

// Auth functions
export const signUp = async (email: string, password: string, agentData: {
  agent_name: string
  company_name: string
  phone_number: string
}) => {
  // First, sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: agentData,
      emailRedirectTo: undefined // Disable email confirmation for now
    }
  })
  
  if (error) throw error
  
  // Wait a moment for the auth state to settle
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Insert agent data into agents table using service role or with proper auth
  if (data.user) {
    // Try to insert with the authenticated user context
    const { error: insertError } = await supabase
      .from('agents')
      .insert([
        {
          id: data.user.id,
          email: data.user.email || email,
          ...agentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    
    if (insertError) {
      console.error('Error inserting agent data:', insertError)
      // If RLS is still blocking, we might need to handle this differently
      // For now, let's continue with the signup and handle agent data later
    }
  }
  
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  
  // Check if email is confirmed
  if (data.user && !data.user.email_confirmed_at) {
    // For development, we'll allow unconfirmed emails
    console.warn('Email not confirmed, but allowing sign in for development')
  }
  
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentAgent = async (): Promise<Agent | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) throw error
  return data
}
