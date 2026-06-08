import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [user, setUser]           = useState(null)
  const [stats, setStats]         = useState(null)
  const [recentReports, setRecent]= useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Load client count
      const { count: clientCount } = await supabase
        .from('rm_clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Load report count
      const { count: reportCount } = await supabase
        .from('rm_reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Load recent reports
      const { data: recent } = await supabase
        .from('rm_reports')
        .select('id, client_name, month_label, status, created_at, time_taken_seconds')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({ clients: clientCount || 0, reports: reportCount || 0 })
      setRecent(recent || [])
      setLoading(false)
    }
    load()
  }, [])

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  if (loading) return (
    <div className={styles.loading}><span className="spinner" /> Loading dashboard…</div>
  )

  return (
    <div className="container">
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.greeting}>Hi, {name} 👋</h1>
            <p className={styles.greetingSub}>Your ReportMind workspace</p>
          </div>
          <Link to="/reports/new" className="btn btn-violet btn-lg">
            Generate report
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </header>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>👥</span>
            <div>
              <p className={styles.statNum}>{stats.clients}</p>
              <p className={styles.statLabel}>Active clients</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📊</span>
            <div>
              <p className={styles.statNum}>{stats.reports}</p>
              <p className={styles.statLabel}>Reports generated</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>⚡</span>
            <div>
              <p className={styles.statNum}>45s</p>
              <p className={styles.statLabel}>Avg time per report</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🕐</span>
            <div>
              <p className={styles.statNum}>{stats.reports * 4}h</p>
              <p className={styles.statLabel}>Time saved (est.)</p>
            </div>
          </div>
        </div>

        {/* Recent reports */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Recent reports</h2>
            <Link to="/reports" className="btn btn-ghost btn-sm">View all →</Link>
          </div>

          {recentReports.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyIcon}>📋</p>
              <p className={styles.emptyTitle}>No reports yet</p>
              <p className={styles.emptySub}>Generate your first client report in 45 seconds.</p>
              <Link to="/reports/new" className="btn btn-violet" style={{marginTop:16}}>
                Generate first report →
              </Link>
            </div>
          ) : (
            <div className={styles.reportList}>
              {recentReports.map(r => (
                <div key={r.id} className={styles.reportRow}>
                  <div className={styles.reportIcon}>📊</div>
                  <div className={styles.reportInfo}>
                    <p className={styles.reportClient}>{r.client_name}</p>
                    <p className={styles.reportMeta}>{r.month_label}</p>
                  </div>
                  <span className={`chip ${r.status === 'done' ? 'chip-green' : r.status === 'generating' ? 'chip-violet' : 'chip-grey'}`}>
                    {r.status === 'done' ? '✓ Done' : r.status === 'generating' ? '⟳ Generating' : r.status}
                  </span>
                  {r.time_taken_seconds && (
                    <span className={styles.timeBadge}>{r.time_taken_seconds}s</span>
                  )}
                  <Link to={`/reports?id=${r.id}`} className="btn btn-outline btn-sm">View</Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle} style={{marginBottom:16}}>Quick actions</h2>
          <div className={styles.actionsGrid}>
            <Link to="/clients" className={styles.actionCard}>
              <span>👥</span>
              <div>
                <strong>Manage clients</strong>
                <p>Add, edit, or connect Google accounts</p>
              </div>
            </Link>
            <Link to="/reports/new" className={styles.actionCard}>
              <span>⚡</span>
              <div>
                <strong>Generate report</strong>
                <p>Pull live data and write the narrative</p>
              </div>
            </Link>
            <Link to="/reports" className={styles.actionCard}>
              <span>📁</span>
              <div>
                <strong>All reports</strong>
                <p>View, download, or resend past reports</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
