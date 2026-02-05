/**
 * API Client Helper
 * Automatically includes auth token in all requests
 */

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: HeadersInit
}

async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem('token')

  const config: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {})
    }
  }

  if (options.body) {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, config)
  const data = await response.json()

  if (!response.ok) {
    // Handle auth errors
    if (response.status === 401 || data.code === 'UNAUTHORIZED') {
      localStorage.removeItem('token')
      localStorage.removeItem('admin')
      window.location.href = '/login'
      throw new Error('Sesi telah kadaluarsa. Silakan login kembali.')
    }

    // Handle other errors
    throw new Error(data.error?.message || 'Terjadi kesalahan')
  }

  return data
}

// API methods
export const api = {
  get: <T = any>(url: string) => request<T>(url, { method: 'GET' }),
  
  post: <T = any>(url: string, body: any) => 
    request<T>(url, { method: 'POST', body }),
  
  put: <T = any>(url: string, body: any) => 
    request<T>(url, { method: 'PUT', body }),
  
  patch: <T = any>(url: string, body: any) => 
    request<T>(url, { method: 'PATCH', body }),
  
  delete: <T = any>(url: string) => 
    request<T>(url, { method: 'DELETE' })
}
