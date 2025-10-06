export type ApiOptions = RequestInit & { json?: Record<string, unknown> }

export async function apiFetch(input: string, options: ApiOptions = {}) {
  const { json, headers, ...rest } = options
  const init: RequestInit = {
    credentials: 'include',
    ...rest,
    headers: {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    }
  }
  const res = await fetch(input, json ? { ...init, body: JSON.stringify(json) } : init)
  return res
}
