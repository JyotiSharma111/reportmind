import { useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Waitlist.module.css'

const HUB_URL = import.meta.env.VITE_VISULL_HUB_URL || 'https://app.visull.com'

export default function Waitlist() {
  const [email, setEmail]   = useState('')
  const [name, setName]     = useState('')
  const [done, setDone]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: err } = await supabase
      .from('rm_waitlist')
      .insert({ email: email.trim(), name: name.trim() })

    if (err && err.code === '23505') {
      setError("You're already on the waitlist! We'll email you when we launch.")
    } else if (err) {
      setError('Something went wrong. Please try again.')
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <a href={HUB_URL} className={styles.logo}>
          visull<span>.</span><span className={styles.product}>ReportMind</span>
        </a>

        {done ? (
          <div className={styles.success}>
            <span className={styles.successIcon}>🎉</span>
            <h1 className={styles.title}>You're on the list!</h1>
            <p className={styles.subtitle}>
              We'll email <strong>{email}</strong> the moment ReportMind launches.
              Expect early access within weeks.
            </p>
            <a href={HUB_URL} className="btn btn-outline" style={{marginTop:24}}>
              ← Back to Visull
            </a>
          </div>
        ) : (
          <>
            <div className={styles.badge}>Coming soon</div>
            <h1 className={styles.title}>
              Client reports in<br /><em>45 seconds flat.</em>
            </h1>
            <p className={styles.subtitle}>
              ReportMind connects to Google Ads, GA4 & Search Console, then uses AI to write
              the client email narrative. What takes 4–8 hours per client becomes 45 seconds.
            </p>

            <ul className={styles.features}>
              <li>✓ Live Google Ads, GA4 &amp; Search Console sync</li>
              <li>✓ AI-written client email narrative</li>
              <li>✓ White-label PDF exports</li>
              <li>✓ Multi-client workspace</li>
            </ul>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <p className={styles.error}>{error}</p>}
              <div className="form-group">
                <label className="form-label">Your name</label>
                <input className="form-input" type="text" required placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
              </div>
              <div className="form-group">
                <label className="form-label">Work email</label>
                <input className="form-input" type="email" required placeholder="jane@agency.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
              </div>
              <button type="submit" className="btn btn-violet btn-lg" style={{width:'100%', justifyContent:'center'}} disabled={loading || !email || !name}>
                {loading ? <><span className="spinner spinner-white" /> Joining…</> : 'Join the waitlist →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
