<script lang="ts" setup>
import type { PropType } from 'vue'
import BasicHelp from './BasicHelp.vue'

const props = defineProps({
  helpMessage: {
    type: [String, Array] as PropType<string | string[]>,
    default: '',
  },
  span: { type: Boolean },
  normal: { type: Boolean },
})

const prefixCls = 'basic-title'
const slots = useSlots()
const getClass = computed(() => [
  prefixCls,
  { [`${prefixCls}-show-span`]: props.span && slots.default },
  { [`${prefixCls}-normal`]: props.normal },
])
</script>

<template>
  <span :class="getClass">
    <slot />
    <BasicHelp v-if="helpMessage" :class="`${prefixCls}-help`" :text="helpMessage" />
  </span>
</template>

<style lang="scss" scoped>
.basic-title {
  position: relative;
  display: flex;
  padding-left: 7px;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  cursor: pointer;
  user-select: none;

  &-normal {
    font-size: 14px;
    font-weight: 500;
  }

  &-show-span::before {
    position: absolute;
    top: 4px;
    left: 0;
    width: 3px;
    height: 16px;
    margin-right: 4px;
    content: '';
  }

  &-help {
    margin-left: 10px;
  }
}
</style>
