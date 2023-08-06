import { useUserStore } from '@/stores'
import router from '@/router'
import axios, { type Method } from 'axios'
import { showToast } from 'vant'
// import cancelRequest from '@/utils/cancel-request.js'

// 实例化
// const cancelRequestInstance = new cancelRequest()

export const baseURL = 'https://consult-api.itheima.net/'
// 1. 新axios实例，基础配置
const instance = axios.create({
  baseURL,
  timeout: 10000
})

// 2. 请求拦截器，携带token
instance.interceptors.request.use(
  (config) => {
    // 检查之前是否存在相同的请求，如果存在则取消，不存在就记录保存key
    // cancelRequestInstance.checkoutPendingRequest(config, axios.CancelToken)

    const store = useUserStore()
    if (store.user?.token && config.headers) {
      config.headers['Authorization'] = `Bearer ${store.user?.token}`
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 3. 响应拦截器，剥离无效数据，401拦截
instance.interceptors.response.use(
  (res) => {
    // 响应后移除请求记录保存的key
    // cancelRequestInstance.removeRequestKey(res.config, axios.CancelToken)
    // 后台约定，响应成功，但是code不是10000，是业务逻辑失败
    if (res.data?.code !== 10000) {
      showToast(res.data?.message || '业务失败')
      return Promise.reject(new Error(res.data.message))
    }

    // 业务逻辑成功，返回响应数据，作为axios成功的结果
    return res.data
  },
  (err) => {
    if (err.response?.status === 401) {
      // 删除用户信息
      const store = useUserStore()
      store.delUser()
      // 跳转登录，带上接口失效所在页面的地址，登录完成后回跳使用
      router.push({
        path: '/login',
        query: { returnUrl: router.currentRoute.value.fullPath }
      })
    }
    return Promise.reject(err)
  }
)

export default instance

export const request = <T>(
  url: string,
  method: Method = 'GET',
  submitData?: object
) => {
  return instance.request<
    any,
    {
      code: number
      message: string
      data: T
    }
  >({
    url,
    method,
    [method.toUpperCase() === 'GET' ? 'params' : 'data']: submitData
  })
}
