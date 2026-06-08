import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { initiateGoogleOAuth } from '../lib/googleApi'
import styles from './Clients.module.css'

export default function Clients() {
  const [clients, setClients]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [adding, setAdding]     = useState(false)
  const [newName, setNewName]   = useState('')
  const [saving, setSaving]     = useState(false)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('rm_clients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('rm_clients').insert({ user_id: user.id, name: newName.trim(), status: 'active' })
    setNewName('')
    setAdding(false)
    setSaving(false)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Remove this client? Their reports will not be deleted.')) return
    await supabase.from('rm_clients').delete().eq('id', id)
    load()
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Clients</h1>
            <p className={styles.subtitle}>Manage clients and connect their Google accounts for live data.</p>
          </div>
          <button className="btn btn-violet" onClick={() => setAdding(true)}>+ Add client</button>
        </div>

        {adding && (
          <div className={styles.addCard}>
            <h3 className={styles.addTitle}>Add new client</h3>
            <form onSubmit={handleAdd} className={styles.addForm}>
              <input className="form-input" placeholder="Client name, e.g. Acme Marketing"
                value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" className="btn btn-violet" disabled={saving || !newName.trim()}>
                  {saving ? <><span className="spinner spinner-white" /> Saving…</> : 'Add client'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Google OAuth setup guide */}
        <div className={styles.oauthGuide}>
          <div className={styles.oauthGuideIcon}>🔗</div>
          <div className={styles.oauthGuideText}>
            <strong>Connect Google accounts for live data</strong>
            <p>
              To use real client data instead of sample data, you need a{' '}
              <a href="https://console.cloud.google.com" target="_blank" rel="noopener">Google Cloud project</a>{' '}
              with OAuth credentials. Add <code>VITE_GOOGLE_CLIENT_ID</code> to your .env file,
              then click "Connect Google" on any client below.
              {' '}<a href="https://visull.com/docs/google-oauth" target="_blank" rel="noopener">Setup guide →</a>
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'var(--ink-muted)' }}>
            <span className="spinner" />
          </div>
        ) : clients.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>👥</span>
            <h3 className={styles.emptyTitle}>No clients yet</h3>
            <p className={styles.emptySub}>Add your first client to start generating reports.</p>
            <button className="btn btn-violet" onClick={() => setAdding(true)} style={{ marginTop:16 }}>
              Add first client
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {clients.map(client => (
              <div key={client.id} className={styles.clientRow}>
                <div className={styles.clientAvatar}>{client.name.slice(0,2).toUpperCase()}</div>
                <div className={styles.clientInfo}>
                  <p className={styles.clientName}>{client.name}</p>
                  <p className={styles.clientMeta}>
                    Added {new Date(client.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>

                <div className={styles.clientConnections}>
                  <span className={`chip ${client.google_ads_connected ? 'chip-green' : 'chip-grey'}`}>
                    {client.google_ads_connected ? '✓' : '○'} Google Ads
                  </span>
                  <span className={`chip ${client.ga4_connected ? 'chip-green' : 'chip-grey'}`}>
                    {client.ga4_connected ? '✓' : '○'} GA4
                  </span>
                  <span className={`chip ${client.gsc_connected ? 'chip-green' : 'chip-grey'}`}>
                    {client.gsc_connected ? '✓' : '○'} Search Console
                  </span>
                </div>

                <div className={styles.clientActions}>
                  {client.google_ads_connected ? (
                    <span className="chip chip-green">✓ Connected</span>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => initiateGoogleOAuth(client.id)}
                      title="Connect Google Ads, GA4 & Search Console"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Connect Google
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(client.id)}
                    style={{ color:'var(--red)' }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
