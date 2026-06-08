import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Clients.module.css'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding]   = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving]   = useState(false)

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
    if (!confirm('Remove this client?')) return
    await supabase.from('rm_clients').delete().eq('id', id)
    load()
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Clients</h1>
            <p className={styles.subtitle}>Manage your clients and their Google account connections.</p>
          </div>
          <button className="btn btn-violet" onClick={() => setAdding(true)}>
            + Add client
          </button>
        </div>

        {/* Add client modal */}
        {adding && (
          <div className={styles.addCard}>
            <h3 className={styles.addTitle}>Add new client</h3>
            <form onSubmit={handleAdd} className={styles.addForm}>
              <input
                className="form-input"
                placeholder="Client name, e.g. Acme Co"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                autoFocus
              />
              <div style={{display:'flex', gap:10}}>
                <button type="submit" className="btn btn-violet" disabled={saving || !newName.trim()}>
                  {saving ? <><span className="spinner spinner-white" /> Saving…</> : 'Add client'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div style={{textAlign:'center', padding:'60px 0', color:'var(--ink-muted)'}}>
            <span className="spinner" />
          </div>
        ) : clients.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>👥</span>
            <h3 className={styles.emptyTitle}>No clients yet</h3>
            <p className={styles.emptySub}>Add your first client to start generating reports.</p>
            <button className="btn btn-violet" onClick={() => setAdding(true)} style={{marginTop:16}}>
              Add first client
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {clients.map(client => (
              <div key={client.id} className={styles.clientRow}>
                <div className={styles.clientAvatar}>
                  {client.name.slice(0,2).toUpperCase()}
                </div>
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
                  <button className="btn btn-outline btn-sm" disabled title="OAuth coming soon">
                    Connect Google
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(client.id)}
                    style={{color:'var(--red)'}}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.oauthNote}>
          <strong>🔗 Google OAuth integration</strong> — Full Google Ads, GA4, and Search Console connection
          is coming in the next release. Until then, reports use representative sample data so you can
          experience the full workflow.
        </div>
      </div>
    </div>
  )
}
