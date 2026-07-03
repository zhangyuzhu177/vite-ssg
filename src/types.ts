import type { App } from 'vue'
import type { Router } from 'vue-router'

export interface UserModuleContext {
  app: App
  router: Router
  isClient: boolean
}

export type UserModule = (ctx: UserModuleContext) => void
