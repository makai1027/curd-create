<script lang="ts">
import { defineComponent, h } from 'vue'

//   import { BasicTable, useTable, BasicColumn } from '/@/components/Table';
import { ElProgress } from 'element-plus'
import { optionsListApi } from '@/api/demo/select'
import type { BasicColumn } from '@/components/Table/types/table'
import { BasicTable, useTable } from '@/components'
import { demoListApi } from '@/api/demo/table'
import { treeOptionsListApi } from '@/api/demo/tree'

// import { useMessage } from '/@/hooks/web/useMessage'
const columns: BasicColumn[] = [
  {
    label: '输入框',
    prop: 'name',
    edit: true,
    editComponentProps: {
      slots: {
        prefix: '$',
      },
    },
    width: 200,
  },
  {
    label: '默认输入状态',
    prop: 'name7',
    edit: true,
    editable: true,
    width: 200,
  },
  {
    label: '输入框校验',
    prop: 'name1',
    edit: true,
    // 默认必填校验
    editRule: true,
    width: 200,
  },
  {
    label: '输入框函数校验',
    prop: 'name2',
    edit: true,
    editRule: async (text) => {
      if (text === '2')
        return '不能输入该值'

      return ''
    },
    width: 200,
  },
  {
    label: '数字输入框',
    prop: 'id',
    edit: true,
    editRule: true,
    editComponent: 'InputNumber',
    width: 200,
    editComponentProps: () => {
      return {
        max: 100,
        min: 0,
      }
    },
    editRender: ({ text }) => {
      return h(ElProgress, { percentage: Number(text) })
    },
  },
  {
    label: '下拉框',
    prop: 'name3',
    edit: true,
    editComponent: 'Select',
    editComponentProps: {
      options: [
        {
          label: 'Option1',
          value: '1',
        },
        {
          label: 'Option2',
          value: '2',
        },
      ],
    },
    width: 200,
  },
  {
    label: '远程下拉',
    prop: 'name4',
    edit: true,
    editComponent: 'Select',
    editComponentProps: {
      api: optionsListApi,
      resultField: 'list',
      labelField: 'name',
      valueField: 'id',
    },
    width: 200,
  },
  {
    label: '远程下拉树',
    prop: 'name71',
    edit: true,
    editComponent: 'Select',
    editRule: false,
    editComponentProps: {
      api: treeOptionsListApi,
      groupField: 'children',
      labelField: 'title',
      isGroup: true,
      collapseTags: true,
      collapseTagsTooltip: true,
      validateTrigger: 'blur',
      afterFetch: (params: Recordable) => {
        console.log('params: ', params)
        return params.list
      },
      multiple: true,
      resultField: 'list',
    },
    width: 200,
  },
  {
    label: '日期选择',
    prop: 'date',
    edit: true,
    editComponent: 'DatePicker',
    editComponentProps: {
      valueFormat: 'YYYY-MM-DD',
      format: 'YYYY-MM-DD',
    },
    width: 200,
  },
  {
    label: '时间选择',
    prop: 'time',
    edit: true,
    editComponent: 'TimePicker',
    editComponentProps: {
      valueFormat: 'HH:mm',
      format: 'HH:mm',
    },
    width: 200,
  },
  {
    label: '勾选框',
    prop: 'name5',
    edit: true,
    editComponent: 'Checkbox',
    editValueMap: (value) => {
      return value ? '是' : '否'
    },
    width: 200,
  },
  {
    label: '开关',
    prop: 'name6',
    edit: true,
    editComponent: 'Switch',
    editValueMap: (value) => {
      return value ? '开' : '关'
    },
    width: 200,
  },
]
export default defineComponent({
  components: { BasicTable },
  setup() {
    const [registerTable] = useTable({
      title: '可编辑单元格示例',
      api: demoListApi,
      columns,
      showIndexColumn: false,
      border: true,
    })

    // const { createMessage } = useMessage()

    function handleEditEnd({ record, index, key, value }: Recordable) {
      console.log(record, index, key, value)
      return false
    }

    // 模拟将指定数据保存
    function feakSave({ value, key, id }: any) {
      //   createMessage.loading({
      //     content: `正在模拟保存${key}`,
      //     key: '_save_fake_data',
      //     duration: 0
      //   })
      return new Promise((resolve) => {
        setTimeout(() => {
          if (value === '') {
            // createMessage.error({
            //   content: '保存失败：不能为空',
            //   key: '_save_fake_data',
            //   duration: 2
            // })
            resolve(false)
          }
          else {
            // createMessage.success({
            //   content: `记录${id}的${key}已保存`,
            //   key: '_save_fake_data',
            //   duration: 2
            // })
            resolve(true)
          }
        }, 2000)
      })
    }

    async function beforeEditSubmit({ record, index, key, value }: any) {
      console.log('单元格数据正在准备提交', { record, index, key, value })
      return await feakSave({ id: record.id, key, value })
    }

    function handleEditCancel() {
      console.log('cancel')
    }

    return {
      registerTable,
      handleEditEnd,
      handleEditCancel,
      beforeEditSubmit,
    }
  },
})
</script>

<template>
  <div class="p-4">
    <BasicTable
      :before-edit-submit="beforeEditSubmit"
      @register="registerTable"
      @edit-end="handleEditEnd"
      @edit-cancel="handleEditCancel"
    />
  </div>
</template>
