<script setup lang="ts">
import { mobileRules, passwordRules, codeRules } from '@/utils/rules'
import { showToast, type FormInstance, showSuccessToast } from 'vant'
import { onMounted, ref } from 'vue'
import { loginByPassword, sendMobileCode, loginByCode } from '@/services/user'
import { useUserStore } from '@/stores'
import { useRoute, useRouter } from 'vue-router'
import { onUnmounted } from 'vue'
import { throttle, debounce } from 'lodash'

const mobile = ref<string>('13230000001')
const password = ref<string>('abc12345')
const code = ref<string>('')
// 控制密码登录还是验证码登录
const isPass = ref(true)
// 控制密码是否显示
const isShow = ref<boolean>(false)
const isAgree = ref<boolean>(false)

const formRef = ref<FormInstance>()
const time = ref(0)
let ticker: number
// 发送验证码
const onSend = throttle(async () => {
  // 0.已经倒计时time的值大于0，此时不能发送验证码
  if (time.value > 0) return
  // 1.先对手机号单独验证
  await formRef.value?.validate('mobile')
  // 3.显示倒计时
  time.value = 60
  ticker = setInterval(() => {
    time.value--
    if (time.value <= 0) {
      clearInterval(ticker)
    }
  }, 1000)
  // 2.发送请求,提示用户
  const res = await sendMobileCode(mobile.value, 'login')
  console.log(res.data.code)
  showSuccessToast('发送成功')
}, 500)

onUnmounted(() => {
  clearInterval(ticker)
})

const store = useUserStore()
const router = useRouter()
const route = useRoute()
// 表单提交
const onSubmit = async () => {
  if (!isAgree.value) return showToast('请勾选用户协议')
  // 验证完毕，进行登录
  const res = isPass.value
    ? await loginByPassword(mobile.value, password.value)
    : await loginByCode(mobile.value, code.value)
  store.setUser(res.data)
  // 如果有回跳地址就进行回跳，没有跳转到个人中心
  router.push((route.query.returnUrl as string) || '/user')
  showToast('登录成功')
}

// onMounted(() => {
//   // 组件渲染完毕，使用QC生成QQ登录按钮，目的得到跳转链接
//   QC.Login({
//     btnId: 'qq'
//   })
// })
const qqUrl = `https://graph.qq.com/oauth2.0/authorize?client_id=102015968&response_type=token&scope=all&redirect_uri=${encodeURIComponent(
  import.meta.env.VITE_APP_CALLBACK + '/login/callback'
)}`
</script>

<template>
  <div class="login-page">
    <cp-nav-bar
      right-text="注册"
      @click-right="$router.push('/register')"
    ></cp-nav-bar>
    <!-- 头部 -->
    <div class="login-head">
      <h3>{{ isPass ? '密码登录' : '短信验证码登录' }}</h3>
      <a href="javascript:;" @click="isPass = !isPass">
        <span>{{ !isPass ? '密码登录' : '短信验证码登录' }}</span>
        <van-icon name="arrow"></van-icon>
      </a>
    </div>
    <!-- 表单 -->
    <van-form autocomplete="off" @submit="onSubmit" ref="formRef">
      <van-field
        name="mobile"
        v-model="mobile"
        :rules="mobileRules"
        placeholder="请输入手机号"
        type="tel"
      ></van-field>
      <van-field
        v-if="isPass"
        v-model="password"
        :rules="passwordRules"
        placeholder="请输入密码"
        :type="isShow ? 'text' : 'password'"
        :right-icon="!isShow ? 'eye-o' : 'closed-eye'"
        @click-right-icon="isShow = !isShow"
      />
      <van-field
        v-else
        placeholder="短信验证码"
        v-model="code"
        :rules="codeRules"
      >
        <template #button>
          <span class="btn-send" @click="onSend" :class="{ active: time > 0 }">
            {{ time > 0 ? `${time}s后再次发送` : '发送验证码' }}
          </span>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-checkbox v-model="isAgree">
          <span>我已同意</span>
          <a href="javascript:;">用户协议</a>
          <span>及</span>
          <a href="javascript:;">隐私条款</a>
        </van-checkbox>
      </div>
      <div class="cp-cell">
        <van-button block round type="primary" native-type="submit"
          >登 录</van-button
        >
      </div>
      <div class="cp-cell">
        <a href="javascript:;">忘记密码？</a>
      </div>
    </van-form>
    <!-- 底部 -->
    <div class="login-other">
      <van-divider>第三方登录</van-divider>
      <div class="icon" id="qq">
        <a
          @click="store.setReturnUrl($route.query.returnUrl as string)"
          :href="qqUrl"
        >
          <img src="@/assets/qq.svg" alt="" />
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  &-page {
    padding-top: 46px;
  }
  &-head {
    display: flex;
    padding: 30px 30px 50px;
    justify-content: space-between;
    align-items: flex-end;
    line-height: 1;
    h3 {
      font-weight: normal;
      font-size: 24px;
    }
    a {
      font-size: 15px;
    }
  }
  &-other {
    margin-top: 60px;
    padding: 0 30px;
    .icon {
      display: flex;
      justify-content: center;
      img {
        width: 36px;
        height: 36px;
        padding: 4px;
      }
    }
  }
}
.van-form {
  padding: 0 14px;
  .cp-cell {
    height: 52px;
    line-height: 24px;
    padding: 14px 16px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    .van-checkbox {
      a {
        color: var(--cp-primary);
        padding: 0 5px;
      }
    }
  }
  .btn-send {
    color: var(--cp-primary);
    &.active {
      color: rgba(22, 194, 163, 0.5);
    }
  }
}
</style>
