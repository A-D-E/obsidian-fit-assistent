/**
 * Connection token decoder for FitAssistent PAT tokens.
 * Token format: fa_<base64url(JSON.stringify({ u: supabaseUrl, k: anonKey, t: tokenSecret }))>
 */

export interface DecodedToken {
  url: string
  anonKey: string
  secret: string
}

const TOKEN_PREFIX = 'fa_'

/**
 * Checks if a string looks like a valid FitAssistent connection token.
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token.startsWith(TOKEN_PREFIX)) return false
  const decoded = decodeConnectionToken(token)
  return decoded !== null
}

/**
 * Decodes a FitAssistent connection token into its components.
 * Returns null if the token is invalid.
 */
export function decodeConnectionToken(token: string): DecodedToken | null {
  if (!token.startsWith(TOKEN_PREFIX)) return null

  const base64url = token.slice(TOKEN_PREFIX.length)

  try {
    // base64url → base64
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const padding = '='.repeat((4 - (base64.length % 4)) % 4)
    const json = atob(base64 + padding)

    const parsed = JSON.parse(json) as { u?: string; k?: string; t?: string }

    if (!parsed.u || !parsed.k || !parsed.t) return null

    return {
      url: parsed.u,
      anonKey: parsed.k,
      secret: parsed.t,
    }
  } catch {
    return null
  }
}
