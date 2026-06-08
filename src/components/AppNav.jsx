import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AppNav() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const initials = user?.user_metadata?.org_name
    ?.slice(0,2).toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || '?'

  return (
    <nav className="app-nav">
      <div className="container">
        <div className="app-nav-inner">
          <div className="app-logo">
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="24" height="24" rx="6" fill="rgba(124,58,237,0.12)" stroke="rgba(124,58,237,0.4)" strokeWidth="1.2"/>
              <path d="M8 10h12M8 14h8M8 18h10" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="19" cy="18" r="2.5" fill="#7c3aed"/>
            </svg>
            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700 }}>ReportMind</span>
            <span className="dot" style={{ color:'var(--rm)', marginLeft:1 }}>.</span>
          </div>

          <ul className="nav-links">
            <li><NavLink to="/" end>Dashboard</NavLink></li>
            <li><NavLink to="/clients">Clients</NavLink></li>
            <li><NavLink to="/reports">Reports</NavLink></li>
          </ul>

          <div className="nav-user">
            <NavLink to="/reports/new" className="btn btn-violet btn-sm">+ New report</NavLink>
            <div className="nav-avatar" title={user?.email}>{initials}</div>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Sign out" style={{ padding:'6px 10px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10.5 11L14 8l-3.5-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
