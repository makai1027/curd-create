<script lang="ts">
import { defineComponent } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormSchema } from '@/components'
import { BasicForm, useForm } from '@/components'

const schemas: FormSchema[] = [
  {
    field: 'field1',
    component: 'Input',
    label: '字段1',
    colProps: {
      span: 8,
    },
    componentProps: {
      placeholder: '自定义placeholder',
      onChange: (e: any) => {
        console.log(e)
      },
    },
  },
  {
    field: 'field2',
    component: 'Input',
    label: '字段2',
    colProps: {
      span: 8,
    },
  },
  {
    field: 'field3',
    component: 'DatePicker',
    label: '字段3',
    colProps: {
      span: 8,
    },
  },
  {
    field: 'fieldTime',
    component: 'DatePicker',
    label: '时间字段',
    colProps: {
      span: 8,
    },
    componentProps() {
      return {
        type: 'datetimerange',
        rangeSeparator: 'To',
        startPlaceholder: 'Start date',
        endPlaceholder: 'End date',
        style: {
          width: '100%',
          boxSizing: 'border-box',
        },
      }
    },
  },
  {
    field: 'field4',
    component: 'Select',
    label: '字段4',
    colProps: {
      span: 8,
    },
    componentProps: {
      options: [
        {
          label: '选项1',
          value: '1',
          key: '1',
        },
        {
          label: '选项2',
          value: '2',
          key: '2',
        },
      ],
    },
  },
  {
    field: 'field5',
    component: 'CheckboxGroup',
    label: '字段5',
    colProps: {
      span: 8,
    },
    componentProps: {
      options: [
        {
          label: '选项1',
          value: '1',
        },
        {
          label: '选项2',
          value: '2',
        },
      ],
    },
  },
  {
    field: 'field7',
    component: 'RadioGroup',
    label: '字段7',
    colProps: {
      span: 8,
    },
    componentProps: {
      options: [
        {
          label: '选项1',
          value: '1',
        },
        {
          label: '选项2',
          value: '2',
        },
      ],
    },
  },
]

export default defineComponent({
  components: { BasicForm },
  setup() {
    const [register, { setProps, setFieldsValue, updateSchema }] = useForm({
      labelWidth: 120,
      schemas,
      actionColOptions: {
        span: 24,
      },
      fieldMapToTime: [['fieldTime', ['startTime', 'endTime'], 'YYYY-MM']],
    })

    async function handleLoad() {
      const promiseFn = function () {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              field9: ['430000', '430100', '430102'],
              province: '湖南省',
              city: '长沙市',
              district: '岳麓区',
            })
          }, 1000)
        })
      }

      const item = await promiseFn()

      const { field9, province, city, district } = item as any
      await updateSchema({
        field: 'field9',
        componentProps: {
          displayRenderArray: [province, city, district],
        },
      })
      await setFieldsValue({
        field9,
      })
    }

    return {
      register,
      schemas,
      handleSubmit: (values: Recordable) => {
        ElMessage.success(`click search,values:${JSON.stringify(values)}`)
      },
      setProps,
      handleLoad,
    }
  },
})
</script>

<template>
  <el-card title="UseForm操作示例">
    <div class="mb-4">
      <el-button class="mr-2" @click="setProps({ labelWidth: 150 })">
        更改labelWidth
      </el-button>
      <el-button class="mr-2" @click="setProps({ labelWidth: 120 })">
        还原labelWidth
      </el-button>
      <el-button class="mr-2" @click="setProps({ size: 'large' })">
        更改Size
      </el-button>
      <el-button class="mr-2" @click="setProps({ size: 'default' })">
        还原Size
      </el-button>
      <el-button class="mr-2" @click="setProps({ disabled: true })">
        禁用表单
      </el-button>
      <el-button class="mr-2" @click="setProps({ disabled: false })">
        解除禁用
      </el-button>
      <el-button class="mr-2" @click="setProps({ compact: true })">
        紧凑表单
      </el-button>
      <el-button class="mr-2" @click="setProps({ compact: false })">
        还原正常间距
      </el-button>
      <el-button class="mr-2" @click="setProps({ actionColOptions: { span: 8 } })">
        操作按钮位置
      </el-button>
    </div>
    <div class="mb-4">
      <el-button class="mr-2" @click="setProps({ showActionButtonGroup: false })">
        隐藏操作按钮
      </el-button>
      <el-button class="mr-2" @click="setProps({ showActionButtonGroup: true })">
        显示操作按钮
      </el-button>
      <el-button class="mr-2" @click="setProps({ showResetButton: false })">
        隐藏重置按钮
      </el-button>
      <el-button class="mr-2" @click="setProps({ showResetButton: true })">
        显示重置按钮
      </el-button>
      <el-button class="mr-2" @click="setProps({ showSubmitButton: false })">
        隐藏查询按钮
      </el-button>
      <el-button class="mr-2" @click="setProps({ showSubmitButton: true })">
        显示查询按钮
      </el-button>
      <el-button
        class="mr-2"
        @click="
          setProps({
            resetButtonOptions: {
              disabled: true,
              innerTxt: '重置New',
            },
          })
        "
      >
        修改重置按钮
      </el-button>
      <el-button
        class="mr-2"
        @click="
          setProps({
            submitButtonOptions: {
              disabled: true,
              loading: true,
            },
          })
        "
      >
        修改查询按钮
      </el-button>
      <el-button class="mr-2" @click="handleLoad">
        联动回显
      </el-button>
    </div>
    <el-card title="useForm示例">
      <BasicForm @register="register" @submit="handleSubmit" />
    </el-card>
  </el-card>
</template>
