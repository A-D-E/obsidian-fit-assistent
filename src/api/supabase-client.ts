import { requestUrl } from 'obsidian'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { t } from '../i18n'

/**
 * Custom fetch implementation using Obsidian's requestUrl to bypass CORS.
 * Obsidian's requestUrl uses Electron's net module which is not subject to CORS.
 */
function obsidianFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString()
  const method = init?.method ?? 'GET'
  const headers: Record<string, string> = {}

  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headers[key] = value
      })
    } else if (Array.isArray(init.headers)) {
      for (const [key, value] of init.headers) {
        headers[key] = value
      }
    } else {
      Object.assign(headers, init.headers)
    }
  }

  let body: string | undefined
  if (init?.body) {
    body =
      typeof init.body === 'string' ? init.body : JSON.stringify(init.body)
  }

  return requestUrl({
    url,
    method,
    headers,
    body,
    throw: false,
  }).then((response) => {
    const responseHeaders = new Headers(response.headers)
    // Use response.text instead of response.json to avoid throwing on non-JSON
    let responseBody: string
    try {
      responseBody = JSON.stringify(response.json)
    } catch {
      responseBody = response.text
    }
    return new Response(responseBody, {
      status: response.status,
      headers: responseHeaders,
    })
  })
}

let supabaseInstance: SupabaseClient | null = null

/**
 * Creates or returns the Supabase client with Obsidian CORS bypass.
 */
export function getSupabaseClient(
  url: string,
  anonKey: string,
): SupabaseClient {
  if (
    supabaseInstance &&
    (supabaseInstance as unknown as { supabaseUrl: string }).supabaseUrl === url
  ) {
    return supabaseInstance
  }

  supabaseInstance = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: obsidianFetch as unknown as typeof fetch,
    },
  })

  return supabaseInstance
}

/**
 * Authenticate via PAT: calls the validate-pat edge function directly
 * via requestUrl (bypasses Supabase client for better error handling).
 */
export async function authenticateWithPat(
  url: string,
  anonKey: string,
  tokenSecret: string,
): Promise<{ access_token: string; expires_at: number } | { error: string }> {
  const functionsUrl = `${url}/functions/v1/main`

  try {
    const response = await requestUrl({
      url: functionsUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({ action: 'validate-pat', token: tokenSecret }),
      throw: false,
    })

    let data: Record<string, unknown>
    try {
      data = response.json
    } catch {
      return { error: `Edge Function returned non-JSON (HTTP ${response.status}): ${response.text.slice(0, 200)}` }
    }

    if (response.status !== 200) {
      const errorCode = (data?.error as string) ?? `HTTP ${response.status}`
      if (errorCode === 'INVALID_TOKEN')
        return { error: t('connection.invalid_token') }
      if (errorCode === 'TOKEN_REVOKED')
        return { error: t('connection.token_revoked') }
      if (errorCode === 'TOKEN_EXPIRED')
        return { error: t('connection.token_expired') }
      return { error: errorCode }
    }

    if (!data?.access_token) {
      return { error: t('auth.no_user') }
    }

    return {
      access_token: data.access_token as string,
      expires_at: data.expires_at as number,
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { error: `${t('connection.error')}: ${msg}` }
  }
}

/**
 * Sets a custom JWT on the Supabase client so RLS works with auth.uid().
 * Uses setSession with the JWT as both access and refresh token.
 */
export async function setSessionFromJwt(
  client: SupabaseClient,
  jwt: string,
): Promise<string | null> {
  const { data, error } = await client.auth.setSession({
    access_token: jwt,
    refresh_token: jwt,
  })

  if (error) return null
  return data.user?.id ?? null
}

/**
 * Returns the current user ID or null.
 */
export async function getCurrentUserId(
  client: SupabaseClient,
): Promise<string | null> {
  const {
    data: { user },
  } = await client.auth.getUser()
  return user?.id ?? null
}

/**
 * Destroys the singleton client instance.
 */
export function destroyClient(): void {
  supabaseInstance = null
}
