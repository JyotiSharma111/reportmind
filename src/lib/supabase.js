import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

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
