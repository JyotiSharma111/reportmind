/**
 * Google API integration for ReportMind
 * 
 * Architecture:
 * - OAuth tokens are stored encrypted in Supabase (rm_clients table)
 * - All API calls go through Google's REST APIs directly from the browser
 * - Tokens are refreshed automatically when expired
 * - Read-only scopes only — we never modify client data
 * 
 * To connect a client's Google account:
 * 1. User clicks "Connect Google" in Clients page
 * 2. OAuth popup opens → user grants read-only access
 * 3. Access + refresh tokens stored in rm_clients row
 * 4. On report generation, tokens are retrieved and used to fetch data
 */

// ── OAuth scopes (read-only) ──────────────────────────────────
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/adwords',           // Google Ads (read)
  'https://www.googleapis.com/auth/analytics.readonly', // GA4 (read)
  'https://www.googleapis.com/auth/webmasters.readonly', // Search Console (read)
].join(' ')

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// ── Initiate Google OAuth flow ────────────────────────────────
export function initiateGoogleOAuth(clientId) {
  if (!GOOGLE_CLIENT_ID) {
    alert('Google Client ID not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.')
    return
  }

  const params = new URLSearchParams({
    client_id:     GOOGLE_CLIENT_ID,
    redirect_uri:  `${window.location.origin}/oauth/callback`,
    response_type: 'code',
    scope:         GOOGLE_SCOPES,
    access_type:   'offline',   // get refresh token
    prompt:        'consent',   // always show consent screen to ensure refresh token
    state:         clientId,    // pass clientId so callback knows which client to update
  })

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

// ── Fetch Google Ads data ─────────────────────────────────────
export async function fetchGoogleAdsData(accessToken, customerId, startDate, endDate) {
  try {
    // Google Ads API requires a developer token and uses a REST API
    // For now returns mock data — replace with real API call once
    // you have a Google Ads developer token approved
    // See: https://developers.google.com/google-ads/api/docs/start
    
    const response = await fetch(
      `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': import.meta.env.VITE_GOOGLE_ADS_DEVELOPER_TOKEN || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            SELECT
              metrics.cost_micros,
              metrics.conversions,
              metrics.clicks,
              metrics.impressions,
              metrics.ctr,
              metrics.conversions_value
            FROM customer
            WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
          `
        })
      }
    )

    if (!response.ok) throw new Error(`Google Ads API error: ${response.status}`)
    const data = await response.json()
    
    // Parse the response
    const row = data[0]?.results?.[0]?.metrics
    if (!row) throw new Error('No data returned')

    const spend = (row.costMicros || 0) / 1_000_000
    const leads = Math.round(row.conversions || 0)

    return {
      ok: true,
      data: {
        spend:       Math.round(spend),
        leads,
        cpl:         leads > 0 ? Math.round(spend / leads) : 0,
        clicks:      row.clicks || 0,
        impressions: row.impressions || 0,
        ctr:         ((row.ctr || 0) * 100).toFixed(1),
        roas:        spend > 0 ? ((row.conversionsValue || 0) / spend).toFixed(1) : '0',
      }
    }
  } catch (err) {
    console.warn('[GoogleAds] API error, using mock data:', err.message)
    return { ok: false, error: err.message }
  }
}

// ── Fetch GA4 data ────────────────────────────────────────────
export async function fetchGA4Data(accessToken, propertyId, startDate, endDate) {
  try {
    const response = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
            { name: 'conversions' },
          ],
        })
      }
    )

    if (!response.ok) throw new Error(`GA4 API error: ${response.status}`)
    const data = await response.json()

    const row = data.rows?.[0]?.metricValues
    if (!row) throw new Error('No GA4 data returned')

    const sessions  = parseInt(row[0]?.value || 0)
    const users     = parseInt(row[1]?.value || 0)
    const bounce    = parseFloat(row[2]?.value || 0) * 100
    const duration  = parseFloat(row[3]?.value || 0)
    const durationMin = Math.floor(duration / 60)
    const durationSec = String(Math.round(duration % 60)).padStart(2, '0')

    return {
      ok: true,
      data: {
        sessions,
        users,
        bounceRate:  bounce.toFixed(1),
        avgDuration: `${durationMin}:${durationSec}`,
        conversions: parseInt(row[4]?.value || 0),
      }
    }
  } catch (err) {
    console.warn('[GA4] API error:', err.message)
    return { ok: false, error: err.message }
  }
}

// ── Fetch Search Console data ─────────────────────────────────
export async function fetchSearchConsoleData(accessToken, siteUrl, startDate, endDate) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 10,
        })
      }
    )

    if (!response.ok) throw new Error(`Search Console API error: ${response.status}`)
    const data = await response.json()

    const totals    = data.rows?.reduce((acc, row) => ({
      clicks:      acc.clicks + row.clicks,
      impressions: acc.impressions + row.impressions,
      position:    acc.position + row.position,
      count:       acc.count + 1,
    }), { clicks:0, impressions:0, position:0, count:0 })

    const topQuery = data.rows?.[0]?.keys?.[0] || 'N/A'

    return {
      ok: true,
      data: {
        clicks:      totals?.clicks || 0,
        impressions: totals?.impressions || 0,
        avgPosition: totals?.count > 0 ? (totals.position / totals.count).toFixed(1) : '0',
        topQuery,
      }
    }
  } catch (err) {
    console.warn('[SearchConsole] API error:', err.message)
    return { ok: false, error: err.message }
  }
}

// ── Date helpers ──────────────────────────────────────────────
export function getMonthDateRange(month, year) {
  // month is 1-indexed
  const start = new Date(year, month - 1, 1)
  const end   = new Date(year, month, 0) // last day of month

  return {
    startDate: start.toISOString().split('T')[0],
    endDate:   end.toISOString().split('T')[0],
  }
}

// ── Previous month for comparison ────────────────────────────
export function getPrevMonthDateRange(month, year) {
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year
  return getMonthDateRange(prevMonth, prevYear)
}

// ── Format month number from name ────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December']

export function monthNameToNumber(name) {
  return MONTH_NAMES.indexOf(name) + 1 // 1-indexed
}
