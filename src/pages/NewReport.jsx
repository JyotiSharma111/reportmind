import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './NewReport.module.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

// Mock data generator — replace with real Google API calls when OAuth is connected
function generateMockData(clientName) {
  const spend     = Math.floor(3000 + Math.random() * 4000)
  const prevSpend = Math.floor(spend * (0.85 + Math.random() * 0.3))
  const sessions  = Math.floor(8000 + Math.random() * 8000)
  const prevSess  = Math.floor(sessions * (0.8 + Math.random() * 0.4))
  const clicks    = Math.floor(2000 + Math.random() * 3000)
  const impr      = Math.floor(clicks * (8 + Math.random() * 6))
  const ctr       = ((clicks / impr) * 100).toFixed(1)
  const leads     = Math.floor(spend / (80 + Math.random() * 60))
  const cpl       = (spend / leads).toFixed(0)

  return {
    ads: {
      spend, prevSpend,
      spendChange: (((spend - prevSpend) / prevSpend) * 100).toFixed(1),
      clicks, impressions: impr, ctr,
      leads, cpl,
      roas: (Math.random() * 2 + 2.5).toFixed(1),
    },
    ga4: {
      sessions, prevSessions: prevSess,
      sessionsChange: (((sessions - prevSess) / prevSess) * 100).toFixed(1),
      users: Math.floor(sessions * 0.82),
      bounceRate: (Math.random() * 20 + 35).toFixed(1),
      avgDuration: `${Math.floor(Math.random() * 2 + 1)}:${String(Math.floor(Math.random() * 60)).padStart(2,'0')}`,
      conversions: leads,
    },
    gsc: {
      clicks: Math.floor(clicks * 0.7),
      impressions: Math.floor(impr * 1.5),
      avgPosition: (Math.random() * 8 + 3).toFixed(1),
      topQuery: `${clientName.split(' ')[0].toLowerCase()} services`,
    },
  }
}

// AI narrative via Anthropic API
async function generateNarrative(clientName, month, year, data) {
  const prompt = `You are a professional marketing account manager writing a monthly performance email to a client.

Client: ${clientName}
Period: ${month} ${year}

PERFORMANCE DATA:
Google Ads:
- Spend: $${data.ads.spend.toLocaleString()} (${data.ads.spendChange > 0 ? '+' : ''}${data.ads.spendChange}% vs last month)
- Leads generated: ${data.ads.leads}
- Cost per lead: $${data.ads.cpl}
- ROAS: ${data.ads.roas}x
- CTR: ${data.ads.ctr}%

GA4 Organic Traffic:
- Sessions: ${data.ga4.sessions.toLocaleString()} (${data.ga4.sessionsChange > 0 ? '+' : ''}${data.ga4.sessionsChange}% vs last month)
- Bounce rate: ${data.ga4.bounceRate}%
- Avg session duration: ${data.ga4.avgDuration}

Search Console:
- Organic clicks: ${data.gsc.clicks.toLocaleString()}
- Average position: ${data.gsc.avgPosition}
- Top query: "${data.gsc.topQuery}"

Write a 3-paragraph professional email narrative for this monthly report. 
- Paragraph 1: Overall summary (positive framing, honest about results)
- Paragraph 2: Key highlights and what drove performance  
- Paragraph 3: What we're doing next month to improve

Tone: professional but warm, data-led, client-friendly. Do NOT include Subject line, greeting, or sign-off — just the 3 paragraphs.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const result = await response.json()
    return result.content?.[0]?.text || 'Unable to generate narrative. Please try again.'
  } catch (err) {
    console.error('Narrative generation error:', err)
    return 'Unable to generate narrative at this time. You can write your own below.'
  }
}

export default function NewReport() {
  const navigate = useNavigate()
  const [clients, setClients]   = useState([])
  const [step, setStep]         = useState(1) // 1=config, 2=generating, 3=review
  const [form, setForm]         = useState({
    clientId: '', clientName: '',
    month: MONTHS[new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1],
    year: new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear(),
  })
  const [data, setData]         = useState(null)
  const [narrative, setNarrative] = useState('')
  const [progress, setProgress] = useState('')
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    async function loadClients() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: clientList } = await supabase
        .from('rm_clients')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name')
      setClients(clientList || [])
    }
    loadClients()
  }, [])

  async function handleGenerate() {
    if (!form.clientName) return
    setStep(2)
    const startTime = Date.now()

    // Step 1 — pull data (mock for now, replace with real API)
    setProgress('Connecting to Google Ads…')
    await new Promise(r => setTimeout(r, 800))
    setProgress('Pulling GA4 traffic data…')
    await new Promise(r => setTimeout(r, 600))
    setProgress('Fetching Search Console rankings…')
    await new Promise(r => setTimeout(r, 500))

    const reportData = generateMockData(form.clientName)
    setData(reportData)

    // Step 2 — generate narrative
    setProgress('AI writing client narrative…')
    const text = await generateNarrative(form.clientName, form.month, form.year, reportData)
    setNarrative(text)

    const elapsed = Math.round((Date.now() - startTime) / 1000)
    setProgress(`Done in ${elapsed}s`)
    setStep(3)
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: saved, error } = await supabase
      .from('rm_reports')
      .insert({
        user_id: user.id,
        client_id: form.clientId || null,
        client_name: form.clientName,
        month_label: `${form.month} ${form.year}`,
        status: 'done',
        report_data: data,
        narrative,
        time_taken_seconds: 45,
      })
      .select()
      .single()

    if (!error) navigate('/reports')
    setSaving(false)
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            ← Back
          </button>
          <div className={styles.stepIndicator}>
            {[1,2,3].map(s => (
              <div key={s} className={`${styles.stepDot} ${step >= s ? styles.stepActive : ''}`}>
                {s === 1 ? 'Configure' : s === 2 ? 'Generating' : 'Review'}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — Configure */}
        {step === 1 && (
          <div className={styles.configCard}>
            <h1 className={styles.title}>Generate client report</h1>
            <p className={styles.subtitle}>Configure the report and we'll pull the data and write the narrative.</p>

            <div className={styles.formGrid}>
              {clients.length > 0 ? (
                <div className="form-group">
                  <label className="form-label">Client</label>
                  <select
                    className="form-input"
                    value={form.clientId}
                    onChange={e => {
                      const client = clients.find(c => c.id === e.target.value)
                      setForm(f => ({ ...f, clientId: e.target.value, clientName: client?.name || '' }))
                    }}
                  >
                    <option value="">Select a client…</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Client name</label>
                  <input
                    className="form-input"
                    placeholder="Acme Co"
                    value={form.clientName}
                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
                  />
                  <p style={{fontSize:12,color:'var(--ink-muted)',marginTop:4}}>
                    No clients yet — <a href="/clients" style={{color:'var(--rm)'}}>add one</a> to connect their Google account.
                  </p>
                </div>
              )}

              <div className={styles.monthRow}>
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <select
                    className="form-input"
                    value={form.month}
                    onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                  >
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select
                    className="form-input"
                    value={form.year}
                    onChange={e => setForm(f => ({ ...f, year: +e.target.value }))}
                  >
                    {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.dataSourcesNote}>
              <p className={styles.dataSourcesTitle}>Data sources</p>
              <div className={styles.dataSources}>
                <span className="chip chip-green">✓ Google Ads</span>
                <span className="chip chip-green">✓ GA4</span>
                <span className="chip chip-green">✓ Search Console</span>
              </div>
              <p className={styles.dataNote}>
                Connect real Google accounts in <a href="/clients" style={{color:'var(--rm)'}}>Clients</a>.
                Until then, sample data is used so you can see the full report experience.
              </p>
            </div>

            <button
              className="btn btn-violet btn-lg"
              onClick={handleGenerate}
              disabled={!form.clientName}
              style={{ marginTop: 8 }}
            >
              Generate report — takes ~45s
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}

        {/* Step 2 — Generating */}
        {step === 2 && (
          <div className={styles.generatingCard}>
            <div className={styles.generatingOrb} />
            <span className="spinner" style={{width:40,height:40,borderWidth:3}} />
            <h2 className={styles.generatingTitle}>Generating report…</h2>
            <p className={styles.generatingStep}>{progress}</p>
            <div className={styles.generatingSteps}>
              {['Pulling Google Ads data','Fetching GA4 sessions','Reading Search Console','AI writing narrative'].map((s, i) => (
                <div key={s} className={styles.genStep}>
                  <span className={styles.genStepDot} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && data && (
          <div className={styles.reviewLayout}>
            <div className={styles.reviewLeft}>
              <div className={styles.reviewHeader}>
                <div>
                  <h1 className={styles.reviewTitle}>{form.clientName}</h1>
                  <p className={styles.reviewPeriod}>{form.month} {form.year} — Performance Report</p>
                </div>
                <div className={styles.reviewActions}>
                  <button onClick={handleSave} className="btn btn-violet" disabled={saving}>
                    {saving ? <><span className="spinner spinner-white" /> Saving…</> : '✓ Save report'}
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Ad Spend</p>
                  <p className={styles.metricVal}>${data.ads.spend.toLocaleString()}</p>
                  <p className={`${styles.metricChange} ${+data.ads.spendChange >= 0 ? styles.up : styles.down}`}>
                    {+data.ads.spendChange >= 0 ? '↑' : '↓'} {Math.abs(data.ads.spendChange)}% vs last month
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Leads</p>
                  <p className={styles.metricVal}>{data.ads.leads}</p>
                  <p className={styles.metricSub}>CPL: ${data.ads.cpl}</p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Organic Sessions</p>
                  <p className={styles.metricVal}>{data.ga4.sessions.toLocaleString()}</p>
                  <p className={`${styles.metricChange} ${+data.ga4.sessionsChange >= 0 ? styles.up : styles.down}`}>
                    {+data.ga4.sessionsChange >= 0 ? '↑' : '↓'} {Math.abs(data.ga4.sessionsChange)}%
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>ROAS</p>
                  <p className={styles.metricVal}>{data.ads.roas}x</p>
                  <p className={styles.metricSub}>Avg position {data.gsc.avgPosition}</p>
                </div>
              </div>

              {/* AI Narrative */}
              <div className={styles.narrativeCard}>
                <div className={styles.narrativeHeader}>
                  <h3 className={styles.narrativeTitle}>
                    <span>✦</span> AI-drafted client email narrative
                  </h3>
                  <button
                    onClick={async () => {
                      setProgress('Rewriting…')
                      const text = await generateNarrative(form.clientName, form.month, form.year, data)
                      setNarrative(text)
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    ↻ Regenerate
                  </button>
                </div>
                <textarea
                  className={styles.narrativeTextarea}
                  value={narrative}
                  onChange={e => setNarrative(e.target.value)}
                  rows={12}
                />
                <p className={styles.narrativeNote}>
                  Edit above — this is the narrative that goes into the client email. AI-drafted, human-approved.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
