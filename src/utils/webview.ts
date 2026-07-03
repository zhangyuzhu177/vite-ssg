export interface MiniProgramBridge {
  navigateTo: (options: { url: string, success?: () => void, fail?: (error: unknown) => void }) => void
  reLaunch: (options: { url: string, success?: () => void, fail?: (error: unknown) => void }) => void
}

export interface ZanNativeBridge {
  init: (options: { kdtId: string }) => void
}

export interface WebviewAuthState {
  kdtId: string
  token: string
}

export const WEBVIEW_KDT_ID_KEY = 'webview_kdtId'
export const WEBVIEW_TOKEN_KEY = 'webview_token'
export const WEBVIEW_DEFAULT_KDT_ID = '43414605'

function canUseStorage() {
  return !import.meta.env.SSR && typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getWebviewAuthState(): WebviewAuthState {
  if (!canUseStorage())
    return { kdtId: WEBVIEW_DEFAULT_KDT_ID, token: '' }

  return {
    kdtId: window.localStorage.getItem(WEBVIEW_KDT_ID_KEY) || WEBVIEW_DEFAULT_KDT_ID,
    token: window.localStorage.getItem(WEBVIEW_TOKEN_KEY) || '',
  }
}

export function setWebviewAuthState(state: Partial<WebviewAuthState>) {
  if (!canUseStorage())
    return

  if (state.kdtId)
    window.localStorage.setItem(WEBVIEW_KDT_ID_KEY, state.kdtId)
  if (state.token !== undefined)
    window.localStorage.setItem(WEBVIEW_TOKEN_KEY, state.token)
}

export function normalizeQueryValue(value: unknown) {
  if (Array.isArray(value))
    return value[0] ? String(value[0]) : ''
  return value == null ? '' : String(value)
}

export function getMiniProgramBridge(): MiniProgramBridge | null {
  if (import.meta.env.SSR)
    return null

  const wx = (window as any).wx
  return wx && wx.miniProgram ? wx.miniProgram : null
}

export function jumpMiniProgramLogin(kdtId: string) {
  const miniProgram = getMiniProgramBridge()
  if (!miniProgram)
    return false

  const query = kdtId ? `?kdtId=${encodeURIComponent(kdtId)}` : ''
  miniProgram.navigateTo({
    url: `/packages/actant/login/index${query}`,
  })
  return true
}

export function initZanNativeBridge(kdtId: string) {
  if (import.meta.env.SSR || typeof window === 'undefined')
    return false

  const zanNativeBridge = (window as Window & { zanNativeBridge?: ZanNativeBridge }).zanNativeBridge
  if (!zanNativeBridge?.init)
    return false

  zanNativeBridge.init({ kdtId })
  return true
}
