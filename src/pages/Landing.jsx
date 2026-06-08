import { useNavigate } from 'react-router-dom'
import styles from './Landing.module.css'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>

      {/* ── Nav ───────────────────────────────────────────── */}
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
          <nav className={styles.navLinks}>
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

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
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
              Start free — 14-day trial
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={() => navigate('/login')} className={styles.btnGhostHero}>
              Already have an account →
            </button>
          </div>
          <p className={styles.heroNote}>No credit card required · Cancel anytime</p>
        </div>

        {/* Report preview card */}
        <div className={styles.heroCard} aria-hidden="true">
          <div className={styles.cardHeader}>
            <div className={styles.cardDots}>
              <span /><span /><span />
            </div>
            <span className={styles.cardTitle}>Acme Co — May 2026</span>
            <span className={styles.cardBadge}>✓ Generated in 43s</span>
          </div>
          <div className={styles.cardMetrics}>
            {[
              { label:'Ad Spend', val:'$4,820', change:'+12%', up:true },
              { label:'Leads',    val:'64',     change:'+8%',  up:true },
              { label:'Sessions', val:'12.4k',  change:'+21%', up:true },
              { label:'ROAS',     val:'3.8x',   change:'+0.4', up:true },
            ].map(m => (
              <div key={m.label} className={styles.metric}>
                <span className={styles.metricLabel}>{m.label}</span>
                <span className={styles.metricVal}>{m.val}</span>
                <span className={styles.metricChange} style={{color:'#00df78'}}>{m.change}</span>
              </div>
            ))}
          </div>
          <div className={styles.cardNarrative}>
            <div className={styles.narrativeTag}>✦ AI narrative</div>
            <p className={styles.narrativeText}>
              May was a strong month for Acme Co, with ad spend up 12% driving
              64 qualified leads — your best lead month this year. Organic sessions
              grew 21%, reflecting the SEO improvements from April...
            </p>
          </div>
          <div className={styles.cardActions}>
            <span className={styles.cardBtn}>Edit narrative</span>
            <span className={styles.cardBtn} style={{background:'rgba(124,58,237,0.15)', color:'#a78bfa'}}>Send to client →</span>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ────────────────────────────── */}
      <div className={styles.strip}>
        {[
          { n:'45s',  l:'average report time' },
          { n:'−97%', l:'less time than manual' },
          { n:'3',    l:'data sources connected' },
          { n:'10',   l:'clients per workspace' },
        ].map((s, i) => (
          <div key={s.l} className={styles.stripItem}>
            {i > 0 && <div className={styles.stripDiv} />}
            <span className={styles.stripN}>{s.n}</span>
            <span className={styles.stripL}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* ── How it works ──────────────────────────────────── */}
      <section className={styles.how} id="how">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>How it works</p>
          <h2 className={styles.sectionTitle}>From data to sent report<br /><em>in under a minute</em></h2>
        </div>
        <div className={styles.steps}>
          {[
            { n:'01', title:'Connect your client', body:'Add a client workspace and connect their Google Ads, GA4 and Search Console accounts with read-only OAuth. Takes 2 minutes per client, once.' },
            { n:'02', title:'Pull live data', body:'Select the client and month. ReportMind fetches the latest campaign spend, traffic, leads, ROAS and search rankings automatically.' },
            { n:'03', title:'AI writes the narrative', body:'Claude reads the numbers and writes a 3-paragraph client email — honest, professional, data-led. You read it, tweak a word if you want, done.' },
            { n:'04', title:'Send or export', body:'Copy the narrative into your email client, or export a white-label PDF with your agency branding. Client gets a polished report, you saved 4 hours.' },
          ].map(s => (
            <div key={s.n} className={styles.step}>
              <span className={styles.stepN}>{s.n}</span>
              <div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className={styles.features} id="features">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Features</p>
          <h2 className={styles.sectionTitle}>Everything an agency needs.<br /><em>Nothing it doesn't.</em></h2>
        </div>
        <div className={styles.featGrid}>
          {[
            { icon:'📊', title:'Live data sync', body:'Google Ads, GA4 and Search Console pull fresh numbers every time. No copy-paste, no stale screenshots.' },
            { icon:'✦',  title:'AI narrative', body:'Claude writes the client email in your voice. Data-led, professionally framed, honest about what\'s up and what\'s down.' },
            { icon:'🏷️', title:'White-label PDFs', body:'Export reports with your agency logo and colours. Clients see your brand, not ours.' },
            { icon:'👥', title:'Multi-client workspace', body:'Manage up to 10 client workspaces. Each client\'s data is separate and secure.' },
            { icon:'🗓️', title:'Monthly scheduling', body:'Set it and forget it. ReportMind generates and queues reports automatically at month end.' },
            { icon:'⚡', title:'45-second reports', body:'What used to take 4–8 hours per client now takes 45 seconds. Do the maths for your agency.' },
          ].map(f => (
            <div key={f.title} className={styles.featCard}>
              <span className={styles.featIcon}>{f.icon}</span>
              <h3 className={styles.featTitle}>{f.title}</h3>
              <p className={styles.featBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section className={styles.pricing} id="pricing">
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
              {['3 client workspaces','Google Ads + GA4 + Search Console','AI narrative drafts','Basic PDF export','Email support'].map(f => <li key={f}><span>✓</span>{f}</li>)}
            </ul>
            <button onClick={() => navigate('/signup')} className={styles.pricingBtn}>Start free →</button>
          </div>

          <div className={`${styles.pricingCard} ${styles.pricingPop}`}>
            <div className={styles.pricingBadge}>Most popular</div>
            <h3 className={styles.pricingName}>Pro</h3>
            <div className={styles.pricingAmount}><span>$</span>49<span className={styles.pricingPer}>/mo</span></div>
            <p className={styles.pricingDesc}>14-day free trial included</p>
            <ul className={styles.pricingFeats}>
              {['10 client workspaces','Everything in Starter','White-label PDF exports','Custom agency branding','Automated monthly scheduling','Priority support'].map(f => <li key={f}><span>✓</span>{f}</li>)}
            </ul>
            <button onClick={() => navigate('/signup')} className={`${styles.pricingBtn} ${styles.pricingBtnPop}`}>Start free trial →</button>
          </div>

        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────── */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Stop spending Mondays<br /><em>writing client reports.</em></h2>
        <p className={styles.ctaSub}>45 seconds per client. Every month. Starting now.</p>
        <button onClick={() => navigate('/signup')} className={styles.btnHero}>
          Start free trial — no card needed →
        </button>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="24" height="24" rx="6" fill="rgba(124,58,237,0.12)" stroke="rgba(124,58,237,0.4)" strokeWidth="1.2"/>
              <path d="M8 10h12M8 14h8M8 18h10" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="19" cy="18" r="2.5" fill="#7c3aed"/>
            </svg>
            <span>ReportMind</span>
            <span className={styles.footerBy}>by <a href="https://visull.com">Visull</a></span>
          </div>
          <div className={styles.footerLinks}>
            <a href="mailto:hello@visull.com">Contact</a>
            <a href="https://visull.com/privacy">Privacy</a>
            <a href="https://visull.com/terms">Terms</a>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} Visull. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}
