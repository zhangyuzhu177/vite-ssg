interface RequestOptions {
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
  kdtId: string
  token: string
}

interface ApiResponse<T> {
  code: number
  data: T
  msg?: string
  message?: string
}

const API_HOST = 'actant.isv-dev.youzan.com'
const API_ORIGIN = `https://${API_HOST}`

export async function request<T>(options: RequestOptions): Promise<T> {
  const method = options.method || 'GET'
  const path = options.path.replace(/^\/+/, '')
  const url = new URL(`/c/${options.kdtId}/${path}`, API_ORIGIN)

  if (method === 'GET' && options.data) {
    Object.entries(options.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null)
        url.searchParams.set(key, String(value))
    })
  }

  const response = await fetch(url.toString(), {
    method,
    credentials: 'include',
    headers: {
      'isv': API_HOST,
      'content-type': 'application/json;charset=UTF-8',
      'Authorization': options.token,
      'kb-version': '4.3.17',
    },
    body: method === 'GET' ? undefined : JSON.stringify(options.data || {}),
  })

  const result = await response.json() as ApiResponse<T>

  if (!response.ok)
    throw new Error(result.msg || result.message || `请求失败：${response.status}`)

  if (result.code === 1)
    return result.data

  throw new Error(result.msg || result.message || '请求失败')
}

export function getUserInfo(kdtId: string, token: string) {
  return request<Record<string, unknown>>({
    path: 'user/info/get',
    kdtId,
    token,
  })
}
