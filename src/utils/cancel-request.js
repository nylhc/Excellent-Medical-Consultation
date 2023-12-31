import qs from 'qs'
export default class CancelRequest {
  constructor() {
    qs.pendingRequest = new Map() //创建map数据，用于存放请求列表
  }
  // 根据请求信息生成唯一标识key
  geterateReqKey(config) {
    const { url, method, params, data } = config
    //将url、method、params、data转换拼接成字符串
    return [url, method, qs.stringify(params), qs.stringify(data)].join('&')
  }
  // 检查是否是重复请求，如果是取消第二次
  checkoutPendingRequest(config, CancelToken) {
    // 为每个请求添加cancelToken,同时拿到source获取到对每个请求取消请求的能力（cancel方法）
    let source = null
    if (config.cancelToken) {
      source = config.source
    } else {
      source = CancelToken.source()
      config.cancelToken = source.token
    }
    //获取当前请求的key
    const requestKey = this.geterateReqKey(config)
    if (qs.pendingRequest.has(requestKey)) {
      // 取消重复请求（第二次）
      source.cancel('double request：' + requestKey)
    } else {
      // 没重复就添加
      qs.pendingRequest.set(requestKey, source)
    }
  }
  // 从请求列表中删除
  removeRequestKey(config) {
    // 延迟一点是为了避免用户快速多次点击提交，而第一次请求成功立刻清除掉，第二次请求不会被取消
    setTimeout(() => {
      const requestKey = this.geterateReqKey(config)
      qs.pendingRequest.delete(requestKey)
    }, 200)
  }
}
