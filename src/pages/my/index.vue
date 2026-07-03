<script setup lang="ts">
import { getUserInfo } from '~/utils/request'
import { getWebviewAuthState, jumpMiniProgramLogin, WEBVIEW_DEFAULT_KDT_ID } from '~/utils/webview'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const userInfo = ref<Record<string, unknown> | null>(null)

function formatValue(value: unknown) {
  if (value == null)
    return '-'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  return JSON.stringify(value)
}

async function loadUserInfo() {
  const { kdtId, token } = getWebviewAuthState()

  if (!token) {
    const jumped = jumpMiniProgramLogin(kdtId || WEBVIEW_DEFAULT_KDT_ID)
    if (!jumped)
      error.value = '未检测到 token，且当前不是小程序环境，无法跳转登录'
    return
  }

  loading.value = true
  error.value = ''

  try {
    userInfo.value = await getUserInfo(kdtId || WEBVIEW_DEFAULT_KDT_ID, token)
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : '获取用户信息失败'
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadUserInfo()
})
</script>

<template>
  <div min-h-100dvh flex flex-col items-center justify-center bg="#f7f8fa" px-6 py-10 text-center text="#323233">
    <section max-w-92 w-full flex flex-col gap-4>
      <h1 m-0 text-7 font-700 leading-9>
        我的页面
      </h1>
      <p m-0 text-4 text="#646566">
        {{ loading ? '正在获取用户信息...' : '当前页面会根据 token 请求 user/info/get 接口' }}
      </p>

      <div v-if="error" rounded-2 bg="#fff1f0" px-4 py-3 text-left text="#cf1322">
        {{ error }}
      </div>

      <div v-else rounded-2 bg-white p-4 text-left shadow="[0_4px_12px_rgba(0,0,0,0.06)]">
        <div mb-2 text-4 font-600 text="#1f1f1f">
          用户信息
        </div>
        <div v-if="userInfo" space-y-2 text-3.5 text="#4b5563">
          <div>
            <span font-600>kdtId:</span>
            <span>{{ getWebviewAuthState().kdtId || '-' }}</span>
          </div>
          <div v-for="(value, key) in userInfo" :key="key">
            <span font-600>{{ key }}:</span>
            <span>{{ formatValue(value) }}</span>
          </div>
        </div>
        <div v-else text-3.5 text="#969799">
          暂无用户信息
        </div>
      </div>

      <div flex flex-col gap-3>
        <button type="button" h-12 rounded-2 border-0 bg="#155bd4" px-4 text-4 text-white font-600 active:bg="#1048aa" @click="loadUserInfo">
          重新获取
        </button>
        <button type="button" h-12 rounded-2 border="1 solid #dcdee0" bg-white px-4 text-4 text="#323233" font-600 active:bg="#f2f3f5" @click="router.push('/')">
          返回首页
        </button>
      </div>
    </section>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
