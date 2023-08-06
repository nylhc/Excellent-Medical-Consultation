<script setup lang="ts">
import type {
  KnowledgeList,
  KnowledgeParams,
  KnowledgeType
} from '@/types/consult'
import KnowledgeCard from './KnowledgeCard.vue'
import { ref } from 'vue'
import { getKnowledgePage } from '@/services/consult'

const props = defineProps<{
  type: KnowledgeType
}>()

const list = ref<KnowledgeList>([])
const params = ref<KnowledgeParams>({
  type: props.type,
  current: 1,
  pageSize: 10
})
const loading = ref(false)
const finished = ref(false)
const onLoad = async () => {
  // 加载更多
  const res = await getKnowledgePage(params.value)
  console.log(res)

  const currentList = [...list.value, ...res.data.rows]
  list.value = currentList
  finished.value = currentList.length === res.data.total
  loading.value = false
  params.value.current++
}
</script>

<template>
  <div class="knowledge-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <knowledge-card v-for="item in list" :key="item.id" :item="item" />
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-list {
  padding: 0 15px;
}
</style>
