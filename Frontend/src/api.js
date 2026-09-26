const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function api(path, { token, method = 'GET', body, headers = {} } = {}) {
    let response
    try {
        response = await fetch(`${API_BASE}${path}`, {
            method,
            headers: {
                ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
            },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        })
    } catch {
        throw new Error(`Cannot reach StockSense API at ${API_BASE}. Check that the backend is running.`)
    }

    if (response.status === 204) return null

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
        const error = new Error(payload?.detail || payload?.message || payload?.error || `Request failed (${response.status})`)
        error.status = response.status
        throw error
    }
    return payload
}

export const apiUrl = API_BASE