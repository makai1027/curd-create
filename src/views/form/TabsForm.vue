<script lang="ts">
import { defineComponent, ref } from 'vue'
import { merge as deepMerge, omit } from 'lodash-es'
import { ElMessage } from 'element-plus'
import type { FormProps, FormSchema, UseFormReturnType } from '@/components'
import { BasicForm, useForm } from '@/components'

export default defineComponent({
  name: 'TabsFormDemo',
  components: { BasicForm },
  setup() {
    interface TabsFormType {
      key: string
      tab: string
      forceRender?: boolean
      Form: UseFormReturnType
    }

    const activeKey = ref('tabs2')
    const loading = ref(false)
    const tabsFormSchema: TabsFormType[] = []

    // 公共属性
    const baseFormConfig: Partial<FormProps> = {
      showActionButtonGroup: false,
      labelWidth: 100,
    }

    // 为每个字段模拟默认值, { tabs1: { field1: '', field2: '' }, tabs2: { field1: '' }, ... }
    const mockDefaultValue: Recordable = {}

    // 模拟5个标签页
    for (let i = 1; i <= 5; ++i) {
      const tabsKey = `tabs${i}`

      // 每个标签页8个字段
      const schemas: FormSchema[] = []
      const row: Recordable = {}

      for (let j = 1; j <= 8; ++j) {
        schemas.push({
          field: `${tabsKey}.field${j}`,
          label: `${tabsKey}-field${j}`,
          component: 'Input',
          colProps: { span: 24 },
        })
        row[`field${j}`] = `field: ${tabsKey}.field${j}, default value`
      }

      mockDefaultValue[tabsKey] = row

      tabsFormSchema.push({
        key: tabsKey,
        tab: tabsKey,
        forceRender: true,
        Form: useForm(Object.assign({ schemas }, baseFormConfig) as FormProps),
      })
    }

    async function handleReset() {
      for (const item of tabsFormSchema) {
        const { resetFields } = item.Form[1]
        await resetFields()
      }
    }

    async function handleSubmit() {
      let lastKey = ''
      loading.value = true
      try {
        const values: Recordable = {}
        for (const item of tabsFormSchema) {
          lastKey = item.key
          const { validate, getFieldsValue } = item.Form[1]
          await validate()
          // 表单已支持多级key
          deepMerge(values, getFieldsValue())
        }

        console.log('submit values: ', values)
        ElMessage.success('提交成功！请打开控制台查看')
      }
      catch (e) {
        // 验证失败或出错，切换到对应标签页
        activeKey.value = lastKey
        console.log(e)
      }
      finally {
        loading.value = false
      }
    }

    async function handleSetValues() {
      console.log('默认值为: ', mockDefaultValue)
      for (const item of tabsFormSchema) {
        const { setFieldsValue } = item.Form[1]
        await setFieldsValue(mockDefaultValue)
      }
    }
    return {
      omit,
      loading,
      activeKey,
      tabsFormSchema,
      handleReset,
      handleSubmit,
      handleSetValues,
    }
  },
})
</script>

<template>
  <el-card v-loading="loading" title="标签页+多级field表单">
    <div class="mb-4">
      <el-button class="mr-2" @click="handleReset">
        重置表单
      </el-button>
      <el-button class="mr-2" @click="handleSetValues">
        设置默认值
      </el-button>
      <el-button class="mr-2" type="primary" @click="handleSubmit">
        提交表单
      </el-button>
    </div>
    <el-card title="标签页+多级field表单">
      <el-tabs v-model:activeKey="activeKey">
        <el-tab-pane v-for="item in tabsFormSchema" :key="item.key" v-bind="omit(item, ['Form', 'key'])">
          <BasicForm @register="item.Form[0]" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </el-card>
</template>

<style scoped></style>
