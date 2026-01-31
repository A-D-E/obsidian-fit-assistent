import { requestUrl } from 'obsidian'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

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
    return new Response(JSON.stringify(response.json), {
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
      autoRefreshToken: true,
    },
    global: {
      fetch: obsidianFetch as unknown as typeof fetch,
    },
  })

  return supabaseInstance
}

/**
 * Signs in with email and password.
 */
export async function signIn(
  client: SupabaseClient,
  email: string,
  password: string,
): Promise<{ userId: string } | { error: string }> {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Kein Benutzer gefunden' }
  }

  return { userId: data.user.id }
}

/**
 * Signs out the current user.
 */
export async function signOut(client: SupabaseClient): Promise<void> {
  await client.auth.signOut()
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
