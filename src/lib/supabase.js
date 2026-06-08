import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://mejofyycvbsmcwyvtikn.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lam9meXljdmJzbWN3eXZ0aWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzU3MjcsImV4cCI6MjA5NDgxMTcyN30._ott-AlBhvDIFWBnkLktVpLxM2v132Ce0B9LNttNX4s'

// Cookie scoped to .visull.com — enables silent SSO if user
// visits another Visull tool. Users never notice this.
const STORAGE_KEY = 'visull-auth'

function isProd() {
  return typeof window !== 'undefined' &&
    window.location.hostname.endsWith('.visull.com')
}

const cookieStorage = {
  getItem(key) {
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
  },
  setItem(key, value) {
    const domain  = isProd() ? '; domain=.visull.com' : ''
    const secure  = isProd() ? '; Secure' : ''
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires}; path=/${domain}; SameSite=Lax${secure}`
  },
  removeItem(key) {
    const domain = isProd() ? '; domain=.visull.com' : ''
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`
  },
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storageKey:         STORAGE_KEY,
    storage:            cookieStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: true,
  },
})
