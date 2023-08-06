<script setup lang="ts">
/*global QC*/
import { useSendMobileCode } from '@/composable'
import { loginByQQ, bindMobile } from '@/services/user'
import { onMounted, ref } from 'vue'
import { mobileRules, codeRules } from '@/utils/rules'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import type { User } from '@/types/user'
import { showSuccessToast } from 'vant'

const openId = ref('')
const isNeedBind = ref(false)
onMounted(() => {
  if (QC.Login.check()) {
    QC.Login.getMe(async (id) => {
      openId.value = id
      // QQ，登录
      try {
        const res = await loginByQQ(id)
          .then((res) => {
            loginSuccess(res)
          })
          .catch(() => {
            isNeedBind.value = false
          })
        console.log('登录成功', res)
      } catch (error) {
        isNeedBind.value = true
        console.log('失败', error)
      }
    })
  }
})
// 表单校验
const mobile = ref('')
const code = ref('')

const store = useUserStore()
const router = useRouter()
const loginSuccess = (res: { data: User }) => {
  // 登录成功后
  // 持久化存储用户数据
  store.setUser(res.data)
  // 如果有回跳地址就进行回跳，没有跳转到个人中心
  router.replace(store.returnUrl || '/user')
  // 提示用户
  showSuccessToast('登录成功')
  store.setReturnUrl('')
}

const bind = async () => {
  // 校验通过
  const res = await bindMobile({
    mobile: mobile.value,
    code: code.value,
    openId: openId.value
  })
  loginSuccess(res)
}

const { form, time, onSend } = useSendMobileCode(mobile, 'bindMobile')
</script>

<template>
  <div class="login-page" v-if="isNeedBind">
    <cp-nav-bar></cp-nav-bar>
    <div class="login-head">
      <h3>手机绑定</h3>
    </div>
    <van-form autocomplete="off" @submit="bind" ref="form">
      <van-field
        v-model="mobile"
        name="mobile"
        :rules="mobileRules"
        placeholder="请输入手机号"
      ></van-field>
      <van-field
        v-model="code"
        name="code"
        :rules="codeRules"
        placeholder="请输入验证码"
      >
        <template #button>
          <span class="btn-send" :class="{ active: time > 0 }" @click="onSend">
            {{ time > 0 ? `${time}s后再次发送` : '发送验证码' }}
          </span>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-button
          style="margin-top: 50px"
          block
          round
          type="primary"
          native-type="submit"
        >
          立即绑定
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/login.scss';
</style>
