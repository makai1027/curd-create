<script lang="ts">
import { defineComponent } from 'vue'
import type { BasicColumn } from '@/components'
import { BasicTable, TableAction, useTable } from '@/components'

import { demoListApi } from '@/api/demo/table'

const columns: BasicColumn[] = [
  {
    label: 'ID',
    prop: 'id',
    fixed: 'left',
    width: 280,
  },
  {
    label: '姓名',
    prop: 'name',
    width: 260,
    edit: true,
    editRule: async (text) => {
      if (text === '2')
        return '不能输入该值'

      return ''
    },
  },
  {
    label: '地址',
    prop: 'address',
  },
  {
    label: '编号',
    prop: 'no',
    width: 300,
  },
  {
    label: '开始时间',
    width: 200,
    prop: 'beginTime',
  },
  {
    label: '结束时间',
    prop: 'endTime',
    width: 200,
  },
]
export default defineComponent({
  components: { BasicTable, TableAction },
  setup() {
    const [registerTable] = useTable({
      title: 'TableAction组件及固定列示例',
      api: demoListApi,
      columns,
      border: true,
      actionColumn: {
        width: 160,
        label: 'Action',
        prop: 'action',
        slots: { cellSlot: 'action' },
      },
    })
    function handleDelete(record: Recordable) {
      console.log('点击了删除', record)
    }
    function handleOpen(record: Recordable) {
      console.log('点击了启用', record)
    }
    return {
      registerTable,
      handleDelete,
      handleOpen,
    }
  },
})
</script>

<template>
  <div class="p-4">
    <BasicTable @register="registerTable">
      <template #action="{ row }">
        <TableAction
          :actions="[
            {
              label: '删除',
              onClick: handleDelete.bind(null, row),
            },
          ]"
          :drop-down-actions="[
            {
              label: '启用',
              popConfirm: {
                title: '是否启用？',
                confirm: handleOpen.bind(null, row),
              },
            },
          ]"
        />
      </template>
    </BasicTable>
  </div>
</template>
