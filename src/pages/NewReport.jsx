import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  fetchGoogleAdsData,
  fetchGA4Data,
  fetchSearchConsoleData,
  getMonthDateRange,
  getPrevMonthDateRange,
  monthNameToNumber,
} from '../lib/googleApi'
import styles from './NewReport.module.css'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

// ── Mock data — used when Google APIs aren't connected ────────
// Clearly labelled in the UI so users know it's sample data
function generateMockData(clientName) {
  const spend     = Math.floor(3000 + Math.random() * 4000)
  const prevSpend = Math.floor(spend * (0.85 + Math.random() * 0.3))
  const sessions  = Math.floor(8000 + Math.random() * 8000)
  const prevSess  = Math.floor(sessions * (0.8 + Math.random() * 0.4))
  const clicks    = Math.floor(2000 + Math.random() * 3000)
  const impr      = Math.floor(clicks * (8 + Math.random() * 6))
  const leads     = Math.floor(spend / (80 + Math.random() * 60))

  return {
    isMock: true,
    ads: {
      spend, prevSpend,
      spendChange: (((spend - prevSpend) / prevSpend) * 100).toFixed(1),
      clicks, impressions: impr,
      ctr: ((clicks / impr) * 100).toFixed(1),
      leads, cpl: Math.round(spend / leads),
      roas: (Math.random() * 2 + 2.5).toFixed(1),
    },
    ga4: {
      sessions, prevSessions: prevSess,
      sessionsChange: (((sessions - prevSess) / prevSess) * 100).toFixed(1),
      users: Math.floor(sessions * 0.82),
      bounceRate: (Math.random() * 20 + 35).toFixed(1),
      avgDuration: `${Math.floor(Math.random() * 2 + 1)}:${String(Math.floor(Math.random() * 60)).padStart(2,'0')}`,
    },
    gsc: {
      clicks: Math.floor(clicks * 0.7),
      impressions: Math.floor(impr * 1.5),
      avgPosition: (Math.random() * 8 + 3).toFixed(1),
      topQuery: `${clientName.split(' ')[0].toLowerCase()} services`,
    },
  }
}

// ── Fetch real data from Google APIs ─────────────────────────
async function fetchRealData(client, month, year) {
  const monthNum  = monthNameToNumber(month)
  const { startDate, endDate } = getMonthDateRange(monthNum, year)
  const { startDate: prevStart, endDate: prevEnd } = getPrevMonthDateRange(monthNum, year)

  const [adsResult, ga4Result, gscResult] = await Promise.all([
    client.google_ads_customer_id
      ? fetchGoogleAdsData(client.access_token, client.google_ads_customer_id, startDate, endDate)
      : Promise.resolve({ ok: false }),
    client.ga4_property_id
      ? fetchGA4Data(client.access_token, client.ga4_property_id, startDate, endDate)
      : Promise.resolve({ ok: false }),
    client.gsc_site_url
      ? fetchSearchConsoleData(client.access_token, client.gsc_site_url, startDate, endDate)
      : Promise.resolve({ ok: false }),
  ])

  // Fetch previous month for comparison
  const [prevAds, prevGa4] = await Promise.all([
    client.google_ads_customer_id && adsResult.ok
      ? fetchGoogleAdsData(client.access_token, client.google_ads_customer_id, prevStart, prevEnd)
      : Promise.resolve({ ok: false }),
    client.ga4_property_id && ga4Result.ok
      ? fetchGA4Data(client.access_token, client.ga4_property_id, prevStart, prevEnd)
      : Promise.resolve({ ok: false }),
  ])

  // If all APIs failed, fall back to mock data
  if (!adsResult.ok && !ga4Result.ok && !gscResult.ok) {
    return null
  }

  const ads = adsResult.ok ? adsResult.data : {}
  const ga4 = ga4Result.ok ? ga4Result.data : {}
  const gsc = gscResult.ok ? gscResult.data : {}
  const pAds = prevAds.ok ? prevAds.data : {}
  const pGa4 = prevGa4.ok ? prevGa4.data : {}

  return {
    isMock: false,
    ads: {
      spend:       ads.spend || 0,
      prevSpend:   pAds.spend || 0,
      spendChange: pAds.spend > 0 ? (((ads.spend - pAds.spend) / pAds.spend) * 100).toFixed(1) : '0',
      leads:       ads.leads || 0,
      cpl:         ads.cpl || 0,
      roas:        ads.roas || '0',
      clicks:      ads.clicks || 0,
      impressions: ads.impressions || 0,
      ctr:         ads.ctr || '0',
    },
    ga4: {
      sessions:       ga4.sessions || 0,
      prevSessions:   pGa4.sessions || 0,
      sessionsChange: pGa4.sessions > 0 ? (((ga4.sessions - pGa4.sessions) / pGa4.sessions) * 100).toFixed(1) : '0',
      users:          ga4.users || 0,
      bounceRate:     ga4.bounceRate || '0',
      avgDuration:    ga4.avgDuration || '0:00',
    },
    gsc: {
      clicks:      gsc.clicks || 0,
      impressions: gsc.impressions || 0,
      avgPosition: gsc.avgPosition || '0',
      topQuery:    gsc.topQuery || 'N/A',
    },
  }
}

// ── AI narrative ──────────────────────────────────────────────
async function generateNarrative(clientName, month, year, data) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey || apiKey === 'placeholder') {
    return `[AI narrative requires an Anthropic API key — add VITE_ANTHROPIC_API_KEY to your .env file]\n\nHere is a template you can edit:\n\n${month} ${year} was a strong month for ${clientName}. Ad spend of $${data.ads.spend?.toLocaleString()} generated ${data.ads.leads} leads at a cost per lead of $${data.ads.cpl}.\n\nOrganic sessions ${+data.ga4.sessionsChange >= 0 ? 'grew' : 'declined'} ${Math.abs(data.ga4.sessionsChange)}% to ${data.ga4.sessions?.toLocaleString()}, with an average session duration of ${data.ga4.avgDuration}.\n\nIn the coming month we will focus on improving performance across the key areas identified in this report.`
  }

  const prompt = `You are a professional marketing account manager writing a monthly performance email to a client.

Client: ${clientName}
Period: ${month} ${year}
Data source: ${data.isMock ? 'Sample data (for demo purposes)' : 'Live Google API data'}

PERFORMANCE DATA:
Google Ads:
- Spend: $${data.ads.spend?.toLocaleString()} (${data.ads.spendChange > 0 ? '+' : ''}${data.ads.spendChange}% vs last month)
- Leads: ${data.ads.leads} at CPL $${data.ads.cpl}
- ROAS: ${data.ads.roas}x · CTR: ${data.ads.ctr}%

GA4 Traffic:
- Sessions: ${data.ga4.sessions?.toLocaleString()} (${data.ga4.sessionsChange > 0 ? '+' : ''}${data.ga4.sessionsChange}% vs last month)
- Bounce rate: ${data.ga4.bounceRate}% · Avg duration: ${data.ga4.avgDuration}

Search Console:
- Organic clicks: ${data.gsc.clicks?.toLocaleString()}
- Avg position: ${data.gsc.avgPosition}
- Top query: "${data.gsc.topQuery}"

Write a 3-paragraph professional client email narrative:
- Para 1: Overall month summary, honest and positive framing
- Para 2: Key highlights and what drove results
- Para 3: What we are doing next month

Tone: warm, professional, data-led. Do NOT include subject line, greeting, or sign-off.`

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
    return result.content?.[0]?.text || 'Unable to generate narrative. Please write your own below.'
  } catch (err) {
    console.error('Narrative error:', err)
    return 'Unable to generate narrative at this time. Please write your own below.'
  }
}

export default function NewReport() {
  const navigate = useNavigate()
  const [clients, setClients]     = useState([])
  const [step, setStep]           = useState(1)
  const [selectedClient, setSelectedClient] = useState(null)
  const [form, setForm]           = useState({
    clientId: '', clientName: '',
    month: MONTHS[new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1],
    year: new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear(),
  })
  const [data, setData]           = useState(null)
  const [narrative, setNarrative] = useState('')
  const [progress, setProgress]   = useState('')
  const [progressStep, setProgressStep] = useState(0)
  const [saving, setSaving]       = useState(false)
  const [elapsed, setElapsed]     = useState(0)

  useEffect(() => {
    async function loadClients() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: list } = await supabase
        .from('rm_clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name')
      setClients(list || [])
    }
    loadClients()
  }, [])

  async function handleGenerate() {
    if (!form.clientName) return
    setStep(2)
    setProgressStep(0)
    const start = Date.now()

    // Step 1 — pull data
    const client = clients.find(c => c.id === form.clientId)
    const isConnected = client?.google_ads_connected || client?.ga4_connected

    setProgress('Connecting to Google Ads…')
    setProgressStep(1)
    await new Promise(r => setTimeout(r, isConnected ? 1200 : 400))

    setProgress('Pulling GA4 traffic data…')
    setProgressStep(2)
    await new Promise(r => setTimeout(r, isConnected ? 1000 : 400))

    setProgress('Fetching Search Console rankings…')
    setProgressStep(3)
    await new Promise(r => setTimeout(r, isConnected ? 800 : 400))

    let reportData
    if (isConnected && client) {
      const realData = await fetchRealData(client, form.month, form.year)
      reportData = realData || generateMockData(form.clientName)
    } else {
      reportData = generateMockData(form.clientName)
    }
    setData(reportData)

    // Step 2 — narrative
    setProgress('AI writing client narrative…')
    setProgressStep(4)
    const text = await generateNarrative(form.clientName, form.month, form.year, reportData)
    setNarrative(text)

    setElapsed(Math.round((Date.now() - start) / 1000))
    setProgressStep(5)
    setProgress('Done!')
    setStep(3)
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('rm_reports')
      .insert({
        user_id:           user.id,
        client_id:         form.clientId || null,
        client_name:       form.clientName,
        month_label:       `${form.month} ${form.year}`,
        status:            'done',
        report_data:       data,
        narrative,
        time_taken_seconds: elapsed || 45,
      })
    setSaving(false)
    if (!error) navigate('/reports')
  }

  const PROGRESS_STEPS = [
    'Pulling Google Ads data',
    'Fetching GA4 sessions',
    'Reading Search Console',
    'AI writing narrative',
  ]

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">← Back</button>
          <div className={styles.stepIndicator}>
            {[1,2,3].map(s => (
              <div key={s} className={`${styles.stepDot} ${step >= s ? styles.stepActive : ''}`}>
                {s === 1 ? 'Configure' : s === 2 ? 'Generating' : 'Review'}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 1: Configure ────────────────────────────── */}
        {step === 1 && (
          <div className={styles.configCard}>
            <h1 className={styles.title}>Generate client report</h1>
            <p className={styles.subtitle}>Configure the report. We'll pull the data and write the narrative.</p>

            <div className={styles.formGrid}>
              {clients.length > 0 ? (
                <div className="form-group">
                  <label className="form-label">Client</label>
                  <select className="form-input" value={form.clientId}
                    onChange={e => {
                      const c = clients.find(c => c.id === e.target.value)
                      setSelectedClient(c || null)
                      setForm(f => ({ ...f, clientId: e.target.value, clientName: c?.name || '' }))
                    }}>
                    <option value="">Select a client…</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.google_ads_connected || c.ga4_connected ? '● Connected' : '○ Not connected'}
                      </option>
                    ))}
                  </select>
                  {selectedClient && !selectedClient.google_ads_connected && !selectedClient.ga4_connected && (
                    <p style={{ fontSize:12, color:'var(--amber)', marginTop:6 }}>
                      ⚠ No Google accounts connected — sample data will be used.{' '}
                      <a href="/clients" style={{ color:'var(--rm)' }}>Connect now →</a>
                    </p>
                  )}
                  {selectedClient?.google_ads_connected && (
                    <p style={{ fontSize:12, color:'var(--green)', marginTop:6 }}>
                      ✓ Google accounts connected — live data will be used.
                    </p>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Client name</label>
                  <input className="form-input" placeholder="Acme Co" value={form.clientName}
                    onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
                  <p style={{ fontSize:12, color:'var(--ink-muted)', marginTop:6 }}>
                    No clients yet — <a href="/clients" style={{ color:'var(--rm)' }}>add one</a> to connect their Google account. Sample data will be used until then.
                  </p>
                </div>
              )}

              <div className={styles.monthRow}>
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <select className="form-input" value={form.month}
                    onChange={e => setForm(f => ({ ...f, month: e.target.value }))}>
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-input" value={form.year}
                    onChange={e => setForm(f => ({ ...f, year: +e.target.value }))}>
                    {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.dataSourcesNote}>
              <p className={styles.dataSourcesTitle}>Data sources</p>
              <div className={styles.dataSources}>
                {['Google Ads', 'GA4', 'Search Console'].map(src => {
                  const connected = src === 'Google Ads'
                    ? selectedClient?.google_ads_connected
                    : src === 'GA4'
                    ? selectedClient?.ga4_connected
                    : selectedClient?.gsc_connected
                  return (
                    <span key={src} className={`chip ${connected ? 'chip-green' : 'chip-grey'}`}>
                      {connected ? '✓' : '○'} {src}
                    </span>
                  )
                })}
              </div>
              {!selectedClient?.google_ads_connected && (
                <p className={styles.dataNote}>
                  Sample data is used until you connect Google accounts in{' '}
                  <a href="/clients" style={{ color:'var(--rm)' }}>Clients</a>.
                  Reports are clearly labelled when using sample data.
                </p>
              )}
            </div>

            <button className="btn btn-violet btn-lg" onClick={handleGenerate}
              disabled={!form.clientName} style={{ marginTop:8 }}>
              Generate report — ~45s
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* ── Step 2: Generating ───────────────────────────── */}
        {step === 2 && (
          <div className={styles.generatingCard}>
            <div className={styles.generatingOrb} />
            <span className="spinner" style={{ width:40, height:40, borderWidth:3 }} />
            <h2 className={styles.generatingTitle}>Generating report…</h2>
            <p className={styles.generatingStep}>{progress}</p>
            <div className={styles.generatingSteps}>
              {PROGRESS_STEPS.map((s, i) => (
                <div key={s} className={styles.genStep}>
                  <span className={`${styles.genStepDot} ${progressStep > i + 1 ? styles.genStepDone : progressStep === i + 1 ? styles.genStepActive : ''}`} />
                  <span style={{ color: progressStep > i + 1 ? '#00df78' : progressStep === i + 1 ? 'var(--rm)' : 'var(--ink-muted)' }}>
                    {progressStep > i + 1 ? '✓ ' : ''}{s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Review ───────────────────────────────── */}
        {step === 3 && data && (
          <div className={styles.reviewLayout}>
            <div className={styles.reviewLeft}>
              <div className={styles.reviewHeader}>
                <div>
                  <h1 className={styles.reviewTitle}>{form.clientName}</h1>
                  <p className={styles.reviewPeriod}>{form.month} {form.year} — Performance Report</p>
                  {data.isMock && (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:6, fontSize:11, fontFamily:'IBM Plex Mono,monospace', color:'var(--amber)', background:'rgba(217,119,6,0.08)', border:'0.5px solid rgba(217,119,6,0.2)', padding:'2px 10px', borderRadius:4 }}>
                      ⚠ Sample data — connect Google accounts for live data
                    </span>
                  )}
                  {!data.isMock && (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:6, fontSize:11, fontFamily:'IBM Plex Mono,monospace', color:'#00df78', background:'rgba(0,223,120,0.08)', border:'0.5px solid rgba(0,223,120,0.2)', padding:'2px 10px', borderRadius:4 }}>
                      ✓ Live data — Google APIs · Generated in {elapsed}s
                    </span>
                  )}
                </div>
                <div className={styles.reviewActions}>
                  <button onClick={handleSave} className="btn btn-violet" disabled={saving}>
                    {saving ? <><span className="spinner spinner-white" /> Saving…</> : '✓ Save report'}
                  </button>
                </div>
              </div>

              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Ad Spend</p>
                  <p className={styles.metricVal}>${(data.ads.spend || 0).toLocaleString()}</p>
                  <p className={`${styles.metricChange} ${+data.ads.spendChange >= 0 ? styles.up : styles.down}`}>
                    {+data.ads.spendChange >= 0 ? '↑' : '↓'} {Math.abs(data.ads.spendChange)}%
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Leads</p>
                  <p className={styles.metricVal}>{data.ads.leads || 0}</p>
                  <p className={styles.metricSub}>CPL: ${data.ads.cpl || 0}</p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Organic Sessions</p>
                  <p className={styles.metricVal}>{(data.ga4.sessions || 0).toLocaleString()}</p>
                  <p className={`${styles.metricChange} ${+data.ga4.sessionsChange >= 0 ? styles.up : styles.down}`}>
                    {+data.ga4.sessionsChange >= 0 ? '↑' : '↓'} {Math.abs(data.ga4.sessionsChange)}%
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>ROAS</p>
                  <p className={styles.metricVal}>{data.ads.roas || '0'}x</p>
                  <p className={styles.metricSub}>Pos. {data.gsc.avgPosition || '–'}</p>
                </div>
              </div>

              <div className={styles.narrativeCard}>
                <div className={styles.narrativeHeader}>
                  <h3 className={styles.narrativeTitle}>
                    <span>✦</span> AI-drafted client email narrative
                  </h3>
                  <button
                    onClick={async () => {
                      const text = await generateNarrative(form.clientName, form.month, form.year, data)
                      setNarrative(text)
                    }}
                    className="btn btn-ghost btn-sm">
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
                  Edit above — AI-drafted, human-approved. This goes in your client email.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
