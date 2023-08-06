import type CpIconVue from '@/components/CpIcon.vue'
import CpNavBarVue from '@/components/cp-nav-bar.vue'
import CpRadioBtn from '@/components/CpRadioBtn.vue'
import CpPaySheet from '@/components/CpPaySheet.vue'

declare module 'vue' {
  interface GlobalComponents {
    CpNavBar: typeof CpNavBarVue
    CpIcon: typeof CpIconVue
    CpRadioBtn: typeof CpRadioBtn
    CpPaySheet: typeof CpPaySheet
  }
}
