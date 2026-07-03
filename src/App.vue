<script setup lang="ts">
import { initZanNativeBridge, normalizeQueryValue, setWebviewAuthState, WEBVIEW_DEFAULT_KDT_ID } from './utils/webview'

const route = useRoute()

watch(
  () => route.query,
  (query) => {
    const kdtId = normalizeQueryValue(query.kdtId || query.kdtid) || WEBVIEW_DEFAULT_KDT_ID
    const token = normalizeQueryValue(query.token)

    setWebviewAuthState({ kdtId, token })
    initZanNativeBridge(kdtId)
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>
