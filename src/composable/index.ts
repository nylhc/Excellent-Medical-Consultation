import { ref, type Ref } from 'vue'
import {
  cancelOrder,
  deleteOrder,
  followOrUnfollow,
  getPrescriptionPic
} from '@/services/consult'
import type { ConsultOrderItem, FollowType } from '@/types/consult'
import {
  showFailToast,
  showImagePreview,
  showSuccessToast,
  type FormInstance,
  showToast
} from 'vant'
import { OrderType } from '@/enums'
import type { OrderDetail } from '@/types/order'
import { onMounted } from 'vue'
import { getMedicalOrderDetail } from '@/services/order'
import type { CodeType } from '@/types/user'
import { sendMobileCode } from '@/services/user'
import { onUnmounted } from 'vue'

// 封装逻辑，规范 useXxx，表示使用某功能

// 关注
export const useFollow = (type: FollowType = 'doc') => {
  const loading = ref(false)
  // {a, b} 类型，传值得时候 {a, b, c} 也可以，这是类型兼容：多的可以给少的
  const follow = async (item: { id: string; likeFlag: 0 | 1 }) => {
    loading.value = true
    try {
      await followOrUnfollow(item.id, type)
      item.likeFlag = item.likeFlag === 1 ? 0 : 1
    } finally {
      loading.value = false
    }
  }
  return { loading, follow }
}

// 封装查看处方逻辑
export const useShowPrescription = () => {
  const onShowPrescription = async (id?: string) => {
    if (id) {
      const res = await getPrescriptionPic(id)
      showImagePreview([res.data.url])
    }
  }
  return { onShowPrescription }
}

// 封装取消订单逻辑
export const useCancelOrder = () => {
  const loading = ref(false)
  const cancelConsultOrder = async (item: ConsultOrderItem) => {
    try {
      loading.value = true
      await cancelOrder(item.id)
      item.status = OrderType.ConsultCancel
      item.statusValue = '已取消'
      showSuccessToast('取消成功')
    } catch (error) {
      showFailToast('取消失败')
    } finally {
      loading.value = false
    }
  }
  return { loading, cancelConsultOrder }
}

// 删除
export const useDeleteOrder = (cb: () => void) => {
  // 删除订单
  const loading = ref(false)
  const deleteConsultOrder = async (item: ConsultOrderItem) => {
    try {
      loading.value = true
      await deleteOrder(item.id)
      showSuccessToast('删除成功')
      // 成功，做其他业务
      cb && cb()
    } catch (e) {
      showFailToast('删除失败')
    } finally {
      loading.value = false
    }
  }
  return { loading, deleteConsultOrder }
}

// 获取订单详情
export const useOrderDetail = (id: string) => {
  const loading = ref(false)
  const order = ref<OrderDetail>()
  onMounted(async () => {
    loading.value = true
    try {
      const res = await getMedicalOrderDetail(id)
      order.value = res.data
    } finally {
      loading.value = false
    }
  })
  return { order, loading }
}

// 发送短信验证码吗逻辑
export const useSendMobileCode = (
  mobile: Ref<string>,
  type: CodeType = 'login'
) => {
  const form = ref<FormInstance>()
  // 定义倒计时
  const time = ref(0)
  let timeId: number
  const onSend = async () => {
    // 先判断如果time>0,终止程序
    if (time.value > 0) return
    // 先对手机号单独校验
    await form.value?.validate('mobile')
    await sendMobileCode(mobile.value, type)
    showToast('发送成功')
    time.value = 60
    // 倒计时
    clearInterval(timeId)
    timeId = setInterval(() => {
      time.value--
      if (time.value <= 0) clearInterval(timeId)
    }, 1000)
  }
  onUnmounted(() => {
    clearInterval(timeId)
  })
  return { form, time, onSend }
}
