/**
 * ReportMind — Login / Signup / Reset password
 * Same quality as CyberGuard's Login.jsx, purple colour scheme.
 */
import { useState } from 'react'
import { supabase } from '../lib/supabase'

function checkStrength(pw) {
  const rules = [
    { label:'8+ characters',    ok: pw.length >= 8 },
    { label:'Uppercase letter', ok: /[A-Z]/.test(pw) },
    { label:'Number',           ok: /[0-9]/.test(pw) },
    { label:'Special character',ok: /[^A-Za-z0-9]/.test(pw) },
  ]
  const score = rules.filter(r => r.ok).length
  return { rules, score, strong: score === 4 }
}
const strengthLabels = ['','Weak','Fair','Good','Strong']
const strengthColors = ['','#ff4757','#ffb627','#a78bfa','#00df78']

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="24" height="24" rx="6" fill="rgba(124,58,237,0.12)" stroke="rgba(124,58,237,0.4)" strokeWidth="1.2"/>
      <path d="M8 10h12M8 14h8M8 18h10" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="19" cy="18" r="2.5" fill="#7c3aed"/>
    </svg>
  )
}

function Field({ label, type='text', value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false)
  const isPw = type === 'password'
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:'#6b7789', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.8px' }}>
        {label}
      </label>
      <div style={{ position:'relative' }}>
        <input
          type={isPw && show ? 'text' : type}
          value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
          style={{ width:'100%', background:'#0f1420', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 36px 10px 12px', fontSize:13, color:'#dde2ed', outline:'none', boxSizing:'border-box', fontFamily:'system-ui,sans-serif' }}
          onFocus={e => e.target.style.borderColor='rgba(124,58,237,0.5)'}
          onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
        />
        {isPw && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#3a4455', padding:0, fontSize:14 }}>
            <i className={`ti ${show ? 'ti-eye-off' : 'ti-eye'}`} aria-hidden="true"/>
          </button>
        )}
      </div>
    </div>
  )
}

function EmailConfirmScreen({ email, onBack }) {
  const [resent, setResent]     = useState(false)
  const [resending, setResending] = useState(false)

  async function handleResend() {
    setResending(true)
    await supabase.auth.resend({ type:'signup', email })
    setResending(false)
    setResent(true)
    setTimeout(() => setResent(false), 5000)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#080b10', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:440, textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', fontSize:32 }}>📧</div>
        <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, color:'#dde2ed', marginBottom:10 }}>Check your inbox</div>
        <div style={{ fontSize:14, color:'#6b7789', marginBottom:6 }}>We sent a confirmation link to:</div>
        <div style={{ display:'inline-block', background:'rgba(124,58,237,0.08)', border:'0.5px solid rgba(124,58,237,0.2)', borderRadius:8, padding:'7px 18px', fontSize:14, color:'#a78bfa', fontFamily:'IBM Plex Mono,monospace', marginBottom:24 }}>{email}</div>
        <div style={{ fontSize:13, color:'#4a5568', lineHeight:1.7, marginBottom:32 }}>Click the link to activate your account. Check your <strong style={{color:'#6b7789'}}>spam folder</strong> if you don't see it.</div>
        <div style={{ background:'#0f1420', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:24 }}>
          {resent && <div style={{ background:'rgba(0,223,120,0.08)', border:'0.5px solid rgba(0,223,120,0.2)', borderRadius:7, padding:'9px 12px', fontSize:12, color:'#00df78', marginBottom:14 }}>✓ Email resent</div>}
          <button onClick={handleResend} disabled={resending || resent}
            style={{ width:'100%', padding:11, background:resent?'rgba(0,223,120,0.06)':'rgba(124,58,237,0.08)', border:`0.5px solid ${resent?'rgba(0,223,120,0.25)':'rgba(124,58,237,0.25)'}`, borderRadius:8, fontSize:13, fontWeight:600, color:resent?'#00df78':'#a78bfa', cursor:resending||resent?'default':'pointer', marginBottom:12 }}>
            {resending ? 'Sending…' : resent ? '✓ Email resent!' : 'Resend confirmation email'}
          </button>
          <button onClick={onBack} style={{ width:'100%', padding:10, background:'transparent', border:'none', fontSize:12, color:'#3a4455', cursor:'pointer' }}>← Back to sign in</button>
        </div>
      </div>
    </div>
  )
}

export default function Login({ defaultMode = 'login' }) {
  const [mode, setMode]         = useState(defaultMode)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [orgName, setOrgName]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [message, setMessage]   = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const clear = () => { setError(''); setMessage('') }
  const strength = mode === 'signup' ? checkStrength(password) : null

  function validate() {
    if (!email.trim())        return 'Email is required'
    if (!email.includes('@')) return 'Enter a valid email address'
    if (mode === 'reset')     return null
    if (!password)            return 'Password is required'
    if (mode === 'signup') {
      if (!strength.strong)   return 'Password must be 8+ chars with uppercase, number, and special character'
      if (password !== confirm) return 'Passwords do not match'
      if (!orgName.trim())    return 'Enter your agency or business name'
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    clear()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: {
            data: { org_name: orgName.trim() },
            emailRedirectTo: 'https://reportmind.visull.com/',
          }
        })
        if (error) throw error
        if (!data.session) { setEmailSent(true); return }
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: 'https://reportmind.visull.com/',
        })
        if (error) throw error
        setMessage('Password reset link sent — check your inbox and spam folder.')
      }
    } catch (err) {
      setError((err.message || 'Something went wrong')
        .replace('Invalid login credentials', 'Incorrect email or password')
        .replace('Email not confirmed', 'Please confirm your email first')
        .replace('User already registered', 'An account with this email already exists — sign in instead'))
    } finally { setLoading(false) }
  }

  if (emailSent) return (
    <EmailConfirmScreen email={email} onBack={() => { setEmailSent(false); setMode('login'); clear() }} />
  )

  const titles = { login:'Welcome back', signup:'Start your free trial', reset:'Reset your password' }
  const subs   = { login:'Sign in to your ReportMind dashboard', signup:'AI-powered client reports in 45 seconds', reset:"We'll email you a reset link" }

  return (
    <div style={{ minHeight:'100vh', background:'#080b10', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <LogoMark/>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#dde2ed' }}>ReportMind</span>
          </div>
          <div style={{ fontSize:18, fontWeight:600, color:'#dde2ed', textAlign:'center', marginBottom:4 }}>{titles[mode]}</div>
          <div style={{ fontSize:13, color:'#6b7789', textAlign:'center' }}>{subs[mode]}</div>
        </div>

        <div style={{ background:'#0f1420', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:12, padding:28 }}>
          <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:8, padding:3, marginBottom:22 }}>
            {[['login','Sign in'],['signup','Sign up']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); clear(); setPassword(''); setConfirm('') }}
                style={{ flex:1, padding:7, fontSize:12, fontWeight:600, border:'none', borderRadius:6, cursor:'pointer', transition:'all .15s',
                  background: mode===m ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color: mode===m ? '#a78bfa' : '#6b7789' }}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <Field label="Agency / business name" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Acme Marketing" autoComplete="organization"/>
            )}
            <Field label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@agency.com" autoComplete={mode==='login'?'email':'username'}/>
            {mode !== 'reset' && (
              <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode==='signup'?'Min 8 chars, uppercase, number, symbol':'Your password'} autoComplete={mode==='login'?'current-password':'new-password'}/>
            )}

            {mode === 'signup' && password.length > 0 && (
              <div style={{ marginBottom:14, marginTop:-8 }}>
                <div style={{ display:'flex', gap:3, marginBottom:5 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex:1, height:3, borderRadius:100, background: i<=strength.score ? strengthColors[strength.score] : 'rgba(255,255,255,0.06)', transition:'background .2s' }}/>
                  ))}
                </div>
                <div style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:strengthColors[strength.score] }}>{strengthLabels[strength.score]}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 12px', marginTop:5 }}>
                  {strength.rules.map(r => (
                    <span key={r.label} style={{ fontFamily:'IBM Plex Mono,monospace', fontSize:9, color:r.ok?'#00df78':'#3a4455' }}>{r.ok?'✓':'○'} {r.label}</span>
                  ))}
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <>
                <Field label="Confirm password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter your password" autoComplete="new-password"/>
                {confirm.length > 0 && (
                  <div style={{ marginBottom:12, marginTop:-10, fontFamily:'IBM Plex Mono,monospace', fontSize:10, color:password===confirm?'#00df78':'#ff4757' }}>
                    {password===confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </>
            )}

            {mode === 'login' && (
              <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
                <button type="button" onClick={() => { setMode('reset'); clear() }}
                  style={{ background:'none', border:'none', fontSize:12, color:'#7c3aed', cursor:'pointer', padding:0 }}>
                  Forgot password?
                </button>
              </div>
            )}

            {error   && <div style={{ background:'rgba(255,71,87,0.08)', border:'0.5px solid rgba(255,71,87,0.25)', borderRadius:7, padding:'9px 12px', fontSize:12, color:'#ff4757', marginBottom:14, lineHeight:1.5 }}>{error}</div>}
            {message && <div style={{ background:'rgba(124,58,237,0.08)', border:'0.5px solid rgba(124,58,237,0.25)', borderRadius:7, padding:'9px 12px', fontSize:12, color:'#a78bfa', marginBottom:14, lineHeight:1.5 }}>{message}</div>}

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:12, background:loading?'rgba(124,58,237,0.05)':'rgba(124,58,237,0.15)', border:'0.5px solid rgba(124,58,237,0.35)', borderRadius:8, fontSize:13, fontWeight:600, color:'#a78bfa', cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all .15s' }}>
              {loading && <i className="ti ti-loader" style={{ animation:'spin 1s linear infinite', fontSize:14 }} aria-hidden="true"/>}
              {loading ? 'Please wait…' : mode==='login' ? 'Sign in' : mode==='signup' ? 'Start free trial' : 'Send reset email'}
            </button>

            {mode === 'reset' && (
              <button type="button" onClick={() => { setMode('login'); clear() }}
                style={{ width:'100%', marginTop:10, padding:10, background:'transparent', border:'none', fontSize:12, color:'#6b7789', cursor:'pointer' }}>
                ← Back to sign in
              </button>
            )}
          </form>

          {mode === 'signup' && (
            <p style={{ fontSize:11, color:'#3a4455', textAlign:'center', marginTop:14, lineHeight:1.6 }}>
              By creating an account you agree to our <a href="/terms" style={{color:'#7c3aed'}}>Terms</a> and <a href="/privacy" style={{color:'#7c3aed'}}>Privacy Policy</a>.
            </p>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:12, color:'#3a4455', marginTop:16 }}>
          {mode==='login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode==='login'?'signup':'login'); clear(); setPassword(''); setConfirm('') }}
            style={{ background:'none', border:'none', color:'#7c3aed', cursor:'pointer', fontSize:12, padding:0 }}>
            {mode==='login' ? 'Start free trial' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
