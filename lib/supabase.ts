import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface PhotoSession {
  id: string
  created_at: string
  session_name?: string
  photos: Photo[]
}

export interface Photo {
  id: string
  session_id: string
  image_url: string
  order_number: number
  created_at: string
}
