<script setup lang="ts">
import wx from 'weixin-js-sdk'
import { getWebviewAuthState, jumpMiniProgramLogin, WEBVIEW_DEFAULT_KDT_ID } from '~/utils/webview'

const router = useRouter()
const currentKdtId = computed(() => getWebviewAuthState().kdtId || WEBVIEW_DEFAULT_KDT_ID)

const result = ref('请选择一个跳转功能进行测试')

function preventPinchZoom(event: Event) {
  event.preventDefault()
}

function preventMultiTouchZoom(event: TouchEvent) {
  if (event.touches.length > 1)
    event.preventDefault()
}

onMounted(() => {
  document.addEventListener('gesturestart', preventPinchZoom, { passive: false })
  document.addEventListener('gesturechange', preventPinchZoom, { passive: false })
  document.addEventListener('gestureend', preventPinchZoom, { passive: false })
  document.addEventListener('touchmove', preventMultiTouchZoom, { passive: false })
})

onBeforeUnmount(() => {
  document.removeEventListener('gesturestart', preventPinchZoom)
  document.removeEventListener('gesturechange', preventPinchZoom)
  document.removeEventListener('gestureend', preventPinchZoom)
  document.removeEventListener('touchmove', preventMultiTouchZoom)
})

function jumpHome() {
  if (wx?.miniProgram) {
    wx.miniProgram.reLaunch({
      url: '/pages/home/dashboard/index',
      success: () => {
        result.value = '小程序首页跳转成功：/pages/home/dashboard/index'
      },
      fail: (error) => {
        result.value = `小程序首页跳转失败：${JSON.stringify(error)}`
      },
    })
    return
  }

  window.location.replace(`https://h5.m.youzan.com/wscshop/showcase/homepage?kdt_id=${currentKdtId.value}`)
}

function jumpMine() {
  if (wx?.miniProgram) {
    wx.miniProgram.reLaunch({
      url: '/packages/usercenter/dashboard/index',
      success: () => {
        result.value = '小程序我的跳转成功：/packages/usercenter/dashboard/index'
      },
      fail: (error) => {
        result.value = `小程序我的跳转失败：${JSON.stringify(error)}`
      },
    })

    setTimeout(() => {
      wx.miniProgram.reLaunch({
        url: '/packages/usercenter/dashboard/index',
      })
    }, 800)
    return
  }

  window.location.replace(`https://h5.m.youzan.com/wscuser/membercenter?kdt_id=${currentKdtId.value}`)
}

function jumpCustomerService() {
  window.location.assign(`https://shop${currentKdtId.value}.youzan.com/v3/im/index?kdt_id=${currentKdtId.value}`)
}

function jumpTest() {
  if (!wx?.miniProgram) {
    result.value = '未检测到微信小程序 WebView 环境'
    return
  }

  wx.miniProgram.navigateTo({
    url: '/packages/actant/test/index',
    success: () => {
      result.value = '测试页跳转成功：/packages/actant/test/index'
    },
    fail: (error) => {
      result.value = `测试页跳转失败：${JSON.stringify(error)}`
    },
  })
}

function jumpWebviewMy() {
  const { kdtId, token } = getWebviewAuthState()

  if (!token) {
    if (!jumpMiniProgramLogin(kdtId || WEBVIEW_DEFAULT_KDT_ID))
      result.value = '未检测到小程序环境，无法跳转登录页'
    else
      result.value = '当前未登录，已跳转小程序登录页'
    return
  }

  router.push('/my')
  result.value = '已在当前 WebView 内跳转到 /my'
}
</script>

<template>
  <div min-h-100dvh flex flex-col items-center justify-center bg="#f7f8fa" px-6 py-10 text-center text="#323233">
    <section max-w-86 w-full flex flex-col gap-4>
      <div mb-3 flex flex-col items-center>
        <h1 m-0 text-7 font-700 leading-9>
          小程序页面跳转测试
        </h1>
        <p mt-2 text-4 text="#646566">
          kdtId: {{ currentKdtId }}
        </p>
      </div>

      <button type="button" bg="#ee0a24" h-12 border-0 rounded-2 px-4 text-4 text-white font-600 active:bg="#cf0a20" @click="jumpCustomerService">
        跳转客服
      </button>
      <button type="button" bg="#155bd4" h-12 border-0 rounded-2 px-4 text-4 text-white font-600 active:bg="#1048aa" @click="jumpHome">
        跳转首页
      </button>
      <button type="button" bg="#07c160" h-12 border-0 rounded-2 px-4 text-4 text-white font-600 active:bg="#05aa53" @click="jumpMine">
        跳转我的
      </button>
      <button type="button" h-12 rounded-2 border="1 solid #dcdee0" bg-white px-4 text-4 text="#323233" font-600 active:bg="#f2f3f5" @click="jumpTest">
        跳转小程序测试页面
      </button>
      <button type="button" h-12 rounded-2 border="1 solid #155bd4" bg-white px-4 text-4 text="#155bd4" font-600 active:bg="#edf4ff" @click="jumpWebviewMy">
        跳转 webview/my 页面
      </button>

      <p min-h-5 break-all pt-2 text-3.5 text="#969799">
        {{ result }}
      </p>
    </section>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
