import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Landing.module.css'

// ── Sample report data — shown on landing page ─────────────────
const SAMPLE_REPORT = {
  client: 'Acme Digital',
  period: 'May 2026',
  ads: {
    spend: 4820, prevSpend: 4305, spendChange: '+12.0',
    leads: 64, cpl: 75, roas: '3.8', ctr: '4.2',
    clicks: 3840, impressions: 91428,
  },
  ga4: {
    sessions: 12400, prevSessions: 10248, sessionsChange: '+21.0',
    users: 9840, bounceRate: '38.2', avgDuration: '2:14',
  },
  gsc: {
    clicks: 2688, impressions: 48200, avgPosition: '4.7',
    topQuery: 'acme digital marketing',
  },
  narrative: `May was your strongest month of the year so far. Ad spend increased 12% to $4,820, driving 64 qualified leads at a cost per lead of $75 — a 6% improvement on April. Your ROAS of 3.8x means every dollar spent returned $3.80 in revenue, well above the 3x benchmark we set together.

Organic traffic was the real highlight. Sessions grew 21% to 12,400, driven by the content updates we made in April starting to rank. Your average position on Google improved to 4.7 and the top query "acme digital marketing" is now appearing in over 48,000 searches per month — up from 31,000 in April.

In June we'll be doubling down on the top-performing ad groups (Competitor and Brand terms both had ROAS above 5x) and publishing two more long-form articles targeting keywords currently ranking between positions 8–15, where a small push should move them onto page one.`,
}

export default function Landing() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ads')

  return (
    <div className={styles.page}>

      {/* ── Nav ──────────────────────────────────────────── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="24" height="24" rx="6" fill="rgba(124,58,237,0.12)" stroke="rgba(124,58,237,0.4)" strokeWidth="1.2"/>
              <path d="M8 10h12M8 14h8M8 18h10" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="19" cy="18" r="2.5" fill="#7c3aed"/>
            </svg>
            <span>ReportMind</span>
          </div>
          <nav className={styles.navLinks} aria-label="Main navigation">
            <a href="#demo">See a report</a>
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className={styles.navCta}>
            <button onClick={() => navigate('/login')} className={styles.btnGhost}>Sign in</button>
            <button onClick={() => navigate('/signup')} className={styles.btnPrimary}>Start free trial</button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={styles.hero} aria-label="ReportMind introduction">
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} aria-hidden="true" />
            Built for marketing agencies
          </div>
          <h1 className={styles.heroTitle}>
            Client reports in<br />
            <span className={styles.heroAccent}>45 seconds.</span><br />
            Not 4 hours.
          </h1>
          <p className={styles.heroSub}>
            ReportMind connects to Google Ads, GA4 and Search Console,
            pulls your client's live data, then uses AI to write the
            monthly email narrative. You review, send, done.
          </p>
          <div className={styles.heroCtas}>
            <button onClick={() => navigate('/signup')} className={styles.btnHero}>
              Start free — no card needed
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <a href="#demo" className={styles.btnGhostHero}>See a sample report ↓</a>
          </div>
          <p className={styles.heroNote}>Free for 3 clients · No credit card required</p>
        </div>

        {/* Mini report preview */}
        <div className={styles.heroCard} aria-hidden="true">
          <div className={styles.cardHeader}>
            <div className={styles.cardDots}><span /><span /><span /></div>
            <span className={styles.cardTitle}>Acme Digital — May 2026</span>
            <span className={styles.cardBadge}>✓ 43s</span>
          </div>
          <div className={styles.cardMetrics}>
            {[
              { label:'Ad Spend', val:'$4,820', change:'+12%' },
              { label:'Leads',    val:'64',     change:'+8%'  },
              { label:'Sessions', val:'12.4k',  change:'+21%' },
              { label:'ROAS',     val:'3.8x',   change:'+0.4' },
            ].map(m => (
              <div key={m.label} className={styles.metric}>
                <span className={styles.metricLabel}>{m.label}</span>
                <span className={styles.metricVal}>{m.val}</span>
                <span className={styles.metricChange}>{m.change}</span>
              </div>
            ))}
          </div>
          <div className={styles.cardNarrative}>
            <div className={styles.narrativeTag}>✦ AI narrative</div>
            <p className={styles.narrativeText}>
              May was your strongest month of the year. Ad spend up 12% drove 64 leads at $75 CPL — a 6% improvement on April. ROAS of 3.8x exceeded your 3x target...
            </p>
          </div>
          <div className={styles.cardActions}>
            <span className={styles.cardBtn}>Edit narrative</span>
            <span className={styles.cardBtnPrimary}>Send to client →</span>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────── */}
      <div className={styles.strip} role="region" aria-label="Key statistics">
        {[
          { n:'45s',  l:'average report time' },
          { n:'−97%', l:'less time than manual' },
          { n:'3',    l:'Google data sources' },
          { n:'10',   l:'clients per workspace' },
        ].map((s, i) => (
          <div key={s.l} className={styles.stripItem}>
            {i > 0 && <div className={styles.stripDiv} aria-hidden="true" />}
            <span className={styles.stripN}>{s.n}</span>
            <span className={styles.stripL}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* ── Sample report demo ────────────────────────────── */}
      <section className={styles.demo} id="demo" aria-label="Sample client report">
        <div className={styles.demoInner}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Live demo</p>
            <h2 className={styles.sectionTitle}>This is what your<br /><em>clients receive.</em></h2>
            <p className={styles.sectionSub}>A real sample report generated by ReportMind. Same format, same AI narrative, same data structure you'll send to your clients.</p>
          </div>

          <div className={styles.reportDemo}>
            {/* Report header */}
            <div className={styles.reportTop}>
              <div>
                <div className={styles.reportClient}>{SAMPLE_REPORT.client}</div>
                <div className={styles.reportPeriod}>{SAMPLE_REPORT.period} — Monthly Performance Report</div>
              </div>
              <div className={styles.reportBadge}>
                <span className={styles.reportBadgeDot} aria-hidden="true" />
                Sample report
              </div>
            </div>

            {/* Metric tabs */}
            <div className={styles.reportTabs} role="tablist" aria-label="Report data sources">
              {[
                { id:'ads', label:'Google Ads' },
                { id:'ga4', label:'GA4 Traffic' },
                { id:'gsc', label:'Search Console' },
              ].map(t => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={activeTab === t.id}
                  className={`${styles.reportTab} ${activeTab === t.id ? styles.reportTabActive : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className={styles.reportMetrics} role="tabpanel">
              {activeTab === 'ads' && (
                <div className={styles.metricsGrid}>
                  {[
                    { label:'Ad Spend',   val:`$${SAMPLE_REPORT.ads.spend.toLocaleString()}`, sub:`${SAMPLE_REPORT.ads.spendChange}% vs last month`, up:true },
                    { label:'Leads',      val:SAMPLE_REPORT.ads.leads, sub:`CPL: $${SAMPLE_REPORT.ads.cpl}`, up:true },
                    { label:'ROAS',       val:`${SAMPLE_REPORT.ads.roas}x`, sub:'Return on ad spend', up:true },
                    { label:'CTR',        val:`${SAMPLE_REPORT.ads.ctr}%`, sub:`${SAMPLE_REPORT.ads.clicks.toLocaleString()} clicks`, up:true },
                  ].map(m => <MetricCard key={m.label} {...m} />)}
                </div>
              )}
              {activeTab === 'ga4' && (
                <div className={styles.metricsGrid}>
                  {[
                    { label:'Sessions',     val:SAMPLE_REPORT.ga4.sessions.toLocaleString(), sub:`${SAMPLE_REPORT.ga4.sessionsChange}% vs last month`, up:true },
                    { label:'Users',        val:SAMPLE_REPORT.ga4.users.toLocaleString(), sub:'Unique visitors', up:true },
                    { label:'Bounce Rate',  val:`${SAMPLE_REPORT.ga4.bounceRate}%`, sub:'Lower is better', up:false },
                    { label:'Avg Duration', val:SAMPLE_REPORT.ga4.avgDuration, sub:'Per session', up:true },
                  ].map(m => <MetricCard key={m.label} {...m} />)}
                </div>
              )}
              {activeTab === 'gsc' && (
                <div className={styles.metricsGrid}>
                  {[
                    { label:'Organic Clicks', val:SAMPLE_REPORT.gsc.clicks.toLocaleString(), sub:'From Google Search', up:true },
                    { label:'Impressions',    val:SAMPLE_REPORT.gsc.impressions.toLocaleString(), sub:'Search appearances', up:true },
                    { label:'Avg Position',   val:SAMPLE_REPORT.gsc.avgPosition, sub:'Average ranking', up:true },
                    { label:'Top Query',      val:SAMPLE_REPORT.gsc.topQuery, sub:'Best performing', up:true },
                  ].map(m => <MetricCard key={m.label} {...m} />)}
                </div>
              )}
            </div>

            {/* AI Narrative */}
            <div className={styles.reportNarrative}>
              <div className={styles.narrativeHeaderRow}>
                <span className={styles.narrativeLabel}>✦ AI-written client email narrative</span>
                <span className={styles.narrativeNote}>This is what gets sent to your client</span>
              </div>
              <div className={styles.narrativeBody}>
                {SAMPLE_REPORT.narrative.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Demo CTA */}
            <div className={styles.demoCta}>
              <p className={styles.demoCtaNote}>Your reports will use your clients' real data. This took 43 seconds to generate.</p>
              <button onClick={() => navigate('/signup')} className={styles.btnHero}>
                Generate your first report free →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className={styles.how} id="how" aria-label="How ReportMind works">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>How it works</p>
          <h2 className={styles.sectionTitle}>From raw data to sent report<br /><em>in under a minute</em></h2>
        </div>
        <ol className={styles.steps}>
          {[
            { n:'01', title:'Connect your client', body:'Add a client workspace and connect their Google Ads, GA4 and Search Console accounts with read-only OAuth. Takes 2 minutes per client, done once.' },
            { n:'02', title:'Pull live data', body:'Select the client and reporting month. ReportMind fetches the latest campaign spend, traffic numbers, leads, ROAS and search rankings automatically.' },
            { n:'03', title:'AI writes the narrative', body:'Our AI reads the numbers and writes a professional client email — honest, data-led, warm. You read it, tweak a word if you want, done.' },
            { n:'04', title:'Send or export', body:'Copy the narrative straight into your email, or export a white-label PDF with your agency branding. 45 seconds. Every month. Every client.' },
          ].map(s => (
            <li key={s.n} className={styles.step}>
              <span className={styles.stepN} aria-hidden="true">{s.n}</span>
              <div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className={styles.features} id="features" aria-label="ReportMind features">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Features</p>
          <h2 className={styles.sectionTitle}>Everything an agency needs.<br /><em>Nothing it doesn't.</em></h2>
        </div>
        <div className={styles.featGrid}>
          {[
            { icon:'📊', title:'Live data sync',      body:'Google Ads, GA4 and Search Console pull fresh numbers every time. No copy-paste, no stale screenshots, no manual exports.' },
            { icon:'✦',  title:'AI narrative',         body:'AI reads the numbers and writes the client email in a professional, warm tone. Data-led. Honest about what\'s up and what\'s down.' },
            { icon:'🏷️', title:'White-label PDFs',    body:'Export reports with your agency logo and brand colours. Clients see your agency, not ours.' },
            { icon:'👥', title:'Multi-client workspace',body:'Manage up to 10 client workspaces. Each client\'s data is isolated and secure. Switch between clients in one click.' },
            { icon:'🗓️', title:'Auto-scheduling',     body:'Set it once. ReportMind generates and queues reports automatically at month end. Wake up to reports ready to review.' },
            { icon:'⚡', title:'45-second reports',    body:'What used to take 4–8 hours per client per month now takes 45 seconds. For an agency with 10 clients, that\'s 50+ hours back every month.' },
          ].map(f => (
            <article key={f.title} className={styles.featCard}>
              <span className={styles.featIcon} aria-hidden="true">{f.icon}</span>
              <h3 className={styles.featTitle}>{f.title}</h3>
              <p className={styles.featBody}>{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section className={styles.pricing} id="pricing" aria-label="ReportMind pricing">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Pricing</p>
          <h2 className={styles.sectionTitle}>Simple pricing.<br /><em>No surprises.</em></h2>
        </div>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <h3 className={styles.pricingName}>Starter</h3>
            <div className={styles.pricingAmount}><span>$</span>0<span className={styles.pricingPer}>/mo</span></div>
            <p className={styles.pricingDesc}>Try it free, no card needed</p>
            <ul className={styles.pricingFeats}>
              {['3 client workspaces','Google Ads + GA4 + Search Console','AI narrative drafts','Basic PDF export','Email support'].map(f => <li key={f}><span aria-hidden="true">✓</span>{f}</li>)}
            </ul>
            <button onClick={() => navigate('/signup')} className={styles.pricingBtn}>Start free →</button>
          </div>

          <div className={`${styles.pricingCard} ${styles.pricingPop}`}>
            <div className={styles.pricingBadge}>Most popular</div>
            <h3 className={styles.pricingName}>Pro</h3>
            <div className={styles.pricingAmount}><span>$</span>49<span className={styles.pricingPer}>/mo</span></div>
            <p className={styles.pricingDesc}>14-day free trial included</p>
            <ul className={styles.pricingFeats}>
              {['10 client workspaces','Everything in Starter','White-label PDF exports','Custom agency branding','Automated monthly scheduling','Priority support'].map(f => <li key={f}><span aria-hidden="true">✓</span>{f}</li>)}
            </ul>
            <button onClick={() => navigate('/signup')} className={`${styles.pricingBtn} ${styles.pricingBtnPop}`}>Start free trial →</button>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className={styles.faqSection} id="faq" aria-label="Frequently asked questions">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>FAQ</p>
          <h2 className={styles.sectionTitle}>Common questions</h2>
        </div>
        <div className={styles.faqList}>
          {[
            { q:'How does ReportMind save time?',         a:'ReportMind connects to your client\'s Google Ads, GA4 and Search Console, pulls the data, and uses AI to write the monthly email narrative. A task that takes 4–8 hours per client becomes 45 seconds.' },
            { q:'Does it work with all Google accounts?',  a:'Yes. ReportMind connects via Google OAuth with read-only permissions. You can connect any Google Ads, GA4 or Search Console account your client gives you access to.' },
            { q:'Will my clients know I use ReportMind?', a:'Not unless you tell them. On the Pro plan, PDF exports use your agency branding. The AI narrative sounds like you — there\'s no ReportMind branding in the output.' },
            { q:'What if the AI narrative isn\'t right?',  a:'The narrative is fully editable before you send it. Think of it as a first draft — it gets the structure and data right, you add your voice and context.' },
            { q:'Is my clients\' data secure?',            a:'Yes. All connections use read-only OAuth — ReportMind cannot modify any of your clients\' accounts. Data is encrypted in transit and at rest. Each client\'s data is isolated from other users.' },
          ].map(item => (
            <details key={item.q} className={styles.faqItem}>
              <summary className={styles.faqQ}>{item.q}</summary>
              <p className={styles.faqA}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className={styles.cta} aria-label="Get started with ReportMind">
        <h2 className={styles.ctaTitle}>Stop spending Mondays<br /><em>writing client reports.</em></h2>
        <p className={styles.ctaSub}>45 seconds per client. Every month. Starting today.</p>
        <button onClick={() => navigate('/signup')} className={styles.btnHero}>
          Start free trial — no card needed →
        </button>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className={styles.footer} role="contentinfo">
        <div className={styles.footerInner}>
          <div>
            <div className={styles.footerLogo}>
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="24" height="24" rx="6" fill="rgba(124,58,237,0.12)" stroke="rgba(124,58,237,0.4)" strokeWidth="1.2"/>
                <path d="M8 10h12M8 14h8M8 18h10" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="19" cy="18" r="2.5" fill="#7c3aed"/>
              </svg>
              <span>ReportMind</span>
              <span className={styles.footerBy}>by <a href="https://visull.com">Visull</a></span>
            </div>
            <p className={styles.footerTagline}>AI-powered client reporting for marketing agencies.</p>
          </div>
          <nav className={styles.footerLinks} aria-label="Footer navigation">
            <a href="#demo">See a report</a>
            <a href="#pricing">Pricing</a>
            <a href="mailto:hello@visull.com">Support</a>
            <a href="https://visull.com/privacy">Privacy</a>
            <a href="https://visull.com/terms">Terms</a>
          </nav>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} Visull. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}

function MetricCard({ label, val, sub, up }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'16px 18px' }}>
      <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'#3a4455', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:700, color:'#dde2ed', letterSpacing:'-0.03em', marginBottom:4 }}>{val}</div>
      <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:11, color: up ? '#00df78' : '#ffb627' }}>{sub}</div>
    </div>
  )
}
