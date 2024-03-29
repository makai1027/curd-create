<script lang="ts" setup>
import { cloneDeep, debounce, merge } from 'lodash-es'
import { ElForm, ElRow } from 'element-plus'
import type { Ref } from 'vue'
import type { FormActionType, FormProps, FormSchema } from './types/form'
import type { AdvanceState } from './types/hooks'
import { dateItemType } from './helper'
import FormItem from './components/FormItem.vue'
import FormAction from './components/FormAction.vue'
import useAdvanced from './hooks/useAdvanced'
import useFormValues from './hooks/useFormValues'
import useAutoFocus from './hooks/useAutoFocus'
import useFormEvents from './hooks/useFormEvents'
import { basicProps } from './props'
import { dateUtil } from '@/components/utils/dateUtil'

// 获取props
const props = defineProps(basicProps)
const emit = defineEmits(['advancedChange', 'reset', 'submit', 'register', 'fieldValueChange'])
// 定义表单对象
const formModel = reactive<Recordable>({})
// 表单默认值对象
const defaultValueRef = ref<Recordable>({})
// 是否已完成默认值初始化
const isInitedDefaultRef = ref(false)
// 用于存储 手动新增、修改的props
const propsRef = ref<Partial<FormProps>>({})
// 设置响应式schema数组，当发生schema变动时，用于替换保存schema，避免直接操作 props
const schemaRef = ref<Nullable<FormSchema[]>>(null)
// 组件ref
const formElRef = ref<Nullable<FormActionType>>(null)
// 样式前缀
const prefixCls = 'basic-form'
// 除props 额外的参数
const attrs = useAttrs()
// 获取form 的基础配置
const getProps = computed((): FormProps => ({ ...props, ...unref(propsRef) } as FormProps))
// 动态样式
const getFormClass = computed(() => {
  return [
    prefixCls,
    {
      [`${prefixCls}--compact`]: getProps.value?.compact,
    },
  ]
})

// 行展开收起
const advanceState = reactive<AdvanceState>({
  isAdvanced: true,
  hideAdvanceBtn: false,
  isLoad: false,
  actionSpan: 6,
})
// 组合 props
const getBindValue = computed<Recordable>(() => ({ ...attrs, ...unref(getProps) }))
// 获取row的style以及组件配置
const getRow = computed(() => {
  const { baseRowStyle, rowProps } = getProps.value
  return {
    style: baseRowStyle,
    ...rowProps,
  }
})

// 获取form schema 配置列表
const getSchema = computed((): FormSchema[] => {
  const schemas: FormSchema[] = unref(schemaRef) || (unref(getProps).schemas as FormSchema[])
  for (const schema of schemas) {
    const { defaultValue, component } = schema
    // 如果是日期组件 默认值需要预处理
    if (defaultValue && dateItemType.includes(component)) {
      if (Array.isArray(defaultValue)) {
        const def: any = []
        defaultValue.forEach((item) => {
          def.push(dateUtil(item))
        })
        schema.defaultValue = def
      }
      else {
        schema.defaultValue = dateUtil(defaultValue)
      }
    }
  }
  // 如果显示操作按钮组
  if (unref(getProps).showAdvancedButton)
    return cloneDeep(schemas.filter(schema => schema.component !== 'Divider') as FormSchema[])
  else
    return cloneDeep(schemas)
})

// 合并props
async function setProps(data: Partial<FormProps>): Promise<void> {
  propsRef.value = merge(unref(propsRef) || {}, data)
}

// 控制表单操作的展开收起
const { handleToggleAdvanced, fieldsIsAdvancedMap } = useAdvanced({
  advanceState,
  emit,
  getProps,
  getSchema,
  formModel,
  defaultValueRef,
})

// 初始化设置默认值，并返回预设时间格式化、修改数据方法
const { handleFormValues, initDefault } = useFormValues({
  defaultValueRef,
  getSchema,
  getProps,
  formModel,
})

// 自动聚焦第一个input
useAutoFocus({
  getSchema,
  getProps,
  isInitedDefault: isInitedDefaultRef,
  formElRef: formElRef as Ref<FormActionType>,
})

const getFormActionBindProps = computed((): Recordable => ({ ...getProps.value, ...advanceState }))

// 初始化表单的内部事件
const {
  handleSubmit,
  setFieldsValue,
  clearValidate,
  validate,
  validateField,
  getFieldsValue,
  updateSchema,
  resetSchema,
  appendSchemaByField,
  removeSchemaByFiled,
  resetFields,
  scrollToField,
} = useFormEvents({
  emit,
  getProps,
  formModel,
  getSchema,
  defaultValueRef,
  formElRef: formElRef as Ref<FormActionType>,
  schemaRef: schemaRef as Ref<FormSchema[]>,
  handleFormValues,
})

// 声明form 事件
const formActionType: FormActionType = {
  getFieldsValue,
  setFieldsValue,
  resetFields,
  updateSchema,
  resetSchema,
  setProps,
  removeSchemaByFiled,
  appendSchemaByField,
  clearValidate,
  validateField,
  validate,
  submit: handleSubmit,
  scrollToField,
}

// 手动设置formModel的value
function setFormModel(key: string, value: any, schema: FormSchema) {
  formModel[key] = value
  if (schema && schema.autoCheck)
    validateField([key]).catch((_) => {})

  emit('fieldValueChange', key, value)
}

// 回车触发提交
function handleEnterPress(e: KeyboardEvent) {
  const { autoSubmitOnEnter } = unref(getProps)
  if (!autoSubmitOnEnter)
    return

  if (e.key === 'Enter' && e.target && e.target instanceof HTMLElement) {
    const target = e.target
    if (target && target.tagName && target.tagName.toLocaleLowerCase() === 'INPUT')
      handleSubmit()
  }
}

// 导出内部事件
defineExpose({
  getBindValue,
  handleToggleAdvanced,
  handleEnterPress,
  formModel,
  defaultValueRef,
  advanceState,
  getRow,
  getProps,
  formElRef,
  getSchema,
  formActionType: formActionType as any,
  setFormModel,
  getFormClass,
  getFormActionBindProps,
  ...formActionType,
})

// 根据model 设置form表单的值
watch(
  () => unref(getProps).model,
  () => {
    const { model } = unref(getProps)
    if (!model)
      return

    setFieldsValue(model)
  },
  {
    immediate: true,
  },
)

// 观测schema的变化重置
watch(
  () => unref(getProps).schemas,
  (schemas) => {
    resetSchema(schemas ?? [])
  },
)

// 是否发生schema增删
watch(
  () => unref(getSchema),
  (schemas) => {
    nextTick(() => {
      // 表单动态添加删除时，自适应高度问题
    })

    // 如若已经初始化，则截断
    if (isInitedDefaultRef.value)
      return

    if (schemas.length) {
      initDefault()
      isInitedDefaultRef.value = true
    }
  },
)

// 观测formModel变化，如果设置了变化自动触发submit，则执行submit
watch(
  () => formModel,
  debounce(() => {
    unref(getProps).submitOnChange && handleSubmit()
  }, 300),
  { deep: true },
)

onMounted(() => {
  initDefault()
  emit('register', formActionType)
})
</script>

<template>
  <ElForm v-bind="getBindValue" ref="formElRef" :class="getFormClass" :model="formModel">
    <ElRow v-bind="getRow">
      <!-- form表单 header 插槽 -->
      <slot name="formHeader" />
      <template v-for="schema in getSchema" :key="schema.field">
        <FormItem
          :is-advanced="fieldsIsAdvancedMap[schema.field]"
          :table-action="tableAction"
          :form-action-type="formActionType"
          :schema="schema"
          :form-props="getProps"
          :all-default-values="defaultValueRef"
          :form-model="formModel"
          :set-form-model="setFormModel"
        >
          <template v-for="item in Object.keys($slots)" #[item]="data">
            <slot :name="item" v-bind="data || {}" />
          </template>
        </FormItem>
      </template>
      <FormAction
        v-bind="getFormActionBindProps"
        @toggle-advanced="handleToggleAdvanced"
        @reset="resetFields"
        @submit="handleSubmit"
      >
        <template v-for="item in ['resetBefore', 'submitBefore', 'advanceBefore', 'advanceAfter']" #[item]="data">
          <slot :name="item" v-bind="data || {}" />
        </template>
      </FormAction>
      <slot name="formFooter" />
    </ElRow>
  </ElForm>
</template>

<style lang="scss" scoped>
.basic-form {
  &--compact {
    ::v-deep(.el-form-item) {
      margin-bottom: 8px !important;
    }
  }
}
</style>
