import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import AppNav from './components/AppNav'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Reports from './pages/Reports'
import NewReport from './pages/NewReport'
import Login from './pages/Login'
import Landing from './pages/Landing'

function AppShell() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Still checking session
  if (session === undefined) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', gap:12, color:'#6b7789', fontFamily:'IBM Plex Mono,monospace', background:'#080b10' }}>
        <div style={{ width:20, height:20, border:'2px solid rgba(124,58,237,.2)', borderTopColor:'#7c3aed', borderRadius:'50%', animation:'rm-spin .65s linear infinite' }}/>
        <style>{`@keyframes rm-spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Logged in — show app
  if (session) {
    return (
      <>
        <AppNav />
        <main>
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/clients"     element={<Clients />} />
            <Route path="/reports"     element={<Reports />} />
            <Route path="/reports/new" element={<NewReport />} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </>
    )
  }

  // Not logged in — landing page with /login route
  return (
    <Routes>
      <Route path="/login"  element={<Login defaultMode="login" />} />
      <Route path="/signup" element={<Login defaultMode="signup" />} />
      <Route path="*"       element={<Landing />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
