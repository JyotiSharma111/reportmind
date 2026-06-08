import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import AppNav from './components/AppNav'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Reports from './pages/Reports'
import NewReport from './pages/NewReport'
import Login from './pages/Login'

function AppShell() {
  const [session, setSession] = useState(undefined) // undefined = still checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Still loading
  if (session === undefined) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', gap:12, color:'#6b7789', fontFamily:'IBM Plex Mono,monospace', background:'#080b10' }}>
        <div style={{ width:20, height:20, border:'2px solid rgba(124,58,237,.2)', borderTopColor:'#7c3aed', borderRadius:'50%', animation:'rm-spin .65s linear infinite' }}/>
        Loading…
        <style>{`@keyframes rm-spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Not logged in — show ReportMind's own login
  if (!session) {
    return <Login />
  }

  // Logged in — show app
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

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
