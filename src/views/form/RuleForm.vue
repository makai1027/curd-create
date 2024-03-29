<script lang="ts">
import { defineComponent } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormSchema } from '@/components'
import { BasicForm, useForm } from '@/components'
import { isAccountExist } from '@/api/demo/system'

const schemas: FormSchema[] = [
  {
    field: 'field1',
    component: 'Input',
    label: '字段1',
    colProps: {
      span: 8,
    },
    required: true,
  },
  {
    field: 'field2',
    component: 'Input',
    label: '字段2',
    colProps: {
      span: 8,
    },
    required: true,
  },
  {
    field: 'id',
    label: 'id',
    required: true,
    defaultValue: 0,
    component: 'InputNumber',
    show: false,
  },
  {
    field: 'field3',
    component: 'DatePicker',
    label: '字段3',
    colProps: {
      span: 8,
    },
    required: true,
  },
  {
    field: 'field33',
    component: 'DatePicker',
    label: '字段33',
    colProps: {
      span: 8,
    },
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
    rules: [{ required: true, type: 'string' }],
  },
  {
    field: 'field44',
    component: 'InputNumber',
    label: '验证码',
    colProps: {
      span: 8,
    },
    required: true,
  },
  {
    field: 'field4',
    component: 'Select',
    label: '字段4',
    colProps: {
      span: 8,
    },
    componentProps: {
      multiple: true,
      collapseTags: true,
      collapseTagsTooltip: true,
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
    dynamicRules: ({ values }) => {
      return values.field2 === 'all'
        ? [
            {
              required: true,
              trigger: 'change',
              validator: (_, value, callback) => {
                if (!value || value.length < 2)
                  callback('请全选')

                callback()
              },
            },
          ]
        : []
    },
    // rules: [
    //   {
    //     required: true,
    //     message: '请输入aa',
    //     type: 'array'
    //   }
    // ]
  },
  {
    field: 'field441',
    component: 'Input',
    label: '自定义校验',
    colProps: {
      span: 8,
    },
    rules: [
      {
        required: true,
        // @ts-ignore
        validator: async (rule, value) => {
          if (!value) {
            return Promise.reject(new Error('值不能为空'))
          }

          if (value === '1') {
            return Promise.reject(new Error('值不能为1'))
          }
          
          return Promise.resolve()
        },
        trigger: 'change',
      },
    ],
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
    rules: [{ required: true }],
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
    rules: [{ required: true, message: '覆盖默认生成的校验信息' }],
  },
  {
    field: 'field8',
    component: 'Input',
    label: '后端异步验证',
    colProps: {
      span: 8,
    },
    helpMessage: ['本字段演示异步验证', '本地规则：必须填写', '后端规则：不能包含admin'],
    rules: [
      {
        required: true,
        message: '请输入数据',
      },
      {
        validator(rule, value, callback) {
          isAccountExist(value)
            .then(() => callback())
            .catch((err) => {
              callback(err.message || '验证失败')
            })
        },
      },
    ],
  },
]

export default defineComponent({
  components: { BasicForm },
  setup() {
    const [register, { validateField, clearValidate, getFieldsValue, resetFields, setFieldsValue }] = useForm({
      labelWidth: 120,
      schemas,
      actionColOptions: {
        span: 24,
      },
    })
    async function validateForm() {
      try {
        const res = await validateField()
        console.log('passing', res)
      }
      catch (error) {
        console.log('not passing', error)
      }
    }
    async function resetValidate() {
      clearValidate()
    }
    function getFormValues() {
      const values = getFieldsValue()
      ElMessage.success(`values:${JSON.stringify(values)}`)
    }
    function setFormValues() {
      setFieldsValue({
        field1: 1111,
        field5: ['1'],
        field7: '1',
        field33: '2020-12-12',
        field3: '2020-12-12',
      })
    }
    return {
      register,
      schemas,
      handleSubmit: (values: any) => {
        ElMessage.success(`click search,values:${JSON.stringify(values)}`)
      },
      getFormValues,
      setFormValues,
      validateForm,
      resetValidate,
      resetFields,
    }
  },
})
</script>

<template>
  <el-card title="表单校验示例">
    <div class="mb-4">
      <ElButton class="mr-2" @click="validateForm">
        手动校验表单
      </ElButton>
      <ElButton class="mr-2" @click="resetValidate">
        清空校验信息
      </ElButton>
      <ElButton class="mr-2" @click="getFormValues">
        获取表单值
      </ElButton>
      <ElButton class="mr-2" @click="setFormValues">
        设置表单值
      </ElButton>
      <ElButton class="mr-2" @click="resetFields">
        重置
      </ElButton>
    </div>
    <el-card title="表单校验">
      <BasicForm @register="register" @submit="handleSubmit" />
    </el-card>
  </el-card>
</template>
