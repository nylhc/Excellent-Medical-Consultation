import type { IllnessTime } from '@/enums'
import { flagOptions, timeOptions } from '@/services/constants'

export const getIllnessTimeText = (time: IllnessTime | undefined) => {
  return timeOptions.find((x) => x.value === time)?.label
}

export const getConsultFlagText = (flag: 0 | 1 | undefined) =>
  flagOptions.find((x) => x.value === flag)?.label
