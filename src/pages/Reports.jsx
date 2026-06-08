import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './Reports.module.css'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('rm_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setReports(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',gap:12,color:'var(--ink-muted)'}}>
      <span className="spinner" /> Loading…
    </div>
  )

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Reports</h1>
            <p className={styles.subtitle}>{reports.length} report{reports.length !== 1 ? 's' : ''} generated</p>
          </div>
          <Link to="/reports/new" className="btn btn-violet">
            + Generate report
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className={styles.empty}>
            <span style={{fontSize:40}}>📊</span>
            <h3>No reports yet</h3>
            <p>Generate your first client report in 45 seconds.</p>
            <Link to="/reports/new" className="btn btn-violet" style={{marginTop:16}}>Generate first report →</Link>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.list}>
              {reports.map(r => (
                <button
                  key={r.id}
                  className={`${styles.reportBtn} ${selected?.id === r.id ? styles.reportSelected : ''}`}
                  onClick={() => setSelected(r)}
                >
                  <div className={styles.reportIcon}>📊</div>
                  <div className={styles.reportInfo}>
                    <p className={styles.reportClient}>{r.client_name}</p>
                    <p className={styles.reportPeriod}>{r.month_label}</p>
                    <p className={styles.reportDate}>{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`chip ${r.status === 'done' ? 'chip-green' : 'chip-grey'}`}>
                    {r.status === 'done' ? '✓ Done' : r.status}
                  </span>
                </button>
              ))}
            </div>

            {selected ? (
              <div className={styles.detail}>
                <div className={styles.detailHeader}>
                  <div>
                    <h2 className={styles.detailClient}>{selected.client_name}</h2>
                    <p className={styles.detailPeriod}>{selected.month_label}</p>
                  </div>
                  {selected.time_taken_seconds && (
                    <span className={styles.timeBadge}>Generated in {selected.time_taken_seconds}s</span>
                  )}
                </div>

                {selected.report_data && (
                  <div className={styles.metricsGrid}>
                    {[
                      { label: 'Ad Spend', val: `$${selected.report_data.ads?.spend?.toLocaleString()}` },
                      { label: 'Leads', val: selected.report_data.ads?.leads },
                      { label: 'Organic Sessions', val: selected.report_data.ga4?.sessions?.toLocaleString() },
                      { label: 'ROAS', val: `${selected.report_data.ads?.roas}x` },
                    ].map(m => (
                      <div key={m.label} className={styles.metricCard}>
                        <p className={styles.metricLabel}>{m.label}</p>
                        <p className={styles.metricVal}>{m.val}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selected.narrative && (
                  <div className={styles.narrativeBox}>
                    <p className={styles.narrativeLabel}>✦ AI narrative</p>
                    <p className={styles.narrativeText}>{selected.narrative}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.detailEmpty}>
                <p>← Select a report to view details</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
