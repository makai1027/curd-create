<script lang="ts">
import type { PropType } from 'vue'

// import { defineComponent } from 'vue'
import { ElDivider } from 'element-plus'
import type { ColumnChangeParam, TableSetting } from '../types/table'
import TableSettingComponent from './settings/index.vue'
import TableTitle from './TableTitle.vue'

export default defineComponent({
  name: 'BasicTableHeader',
  components: {
    ElDivider,
    TableTitle,
    TableSetting: TableSettingComponent,
  },
  props: {
    title: {
      type: [Function, String] as PropType<string | ((data: Recordable) => string)>,
    },
    tableSetting: {
      type: Object as PropType<TableSetting>,
    },
    showTableSetting: {
      type: Boolean,
    },
    titleHelpMessage: {
      type: [String, Array] as PropType<string | string[]>,
      default: '',
    },
  },
  emits: ['columnsChange'],
  setup(_, { emit }) {
    const prefixCls = 'basic-table-header'
    function handleColumnChange(data: ColumnChangeParam[]) {
      emit('columnsChange', data)
    }
    return { prefixCls, handleColumnChange }
  },
})
</script>

<template>
  <div style="width: 100%" :class="prefixCls">
    <div v-if="$slots.headerTop" style="margin: 5px">
      <slot name="headerTop" />
    </div>
    <div class="title-box">
      <slot v-if="$slots.tableTitle" name="tableTitle" />
      <TableTitle v-if="!$slots.tableTitle && title" :help-message="titleHelpMessage" :title="title" />
      <div :class="`${prefixCls}__toolbar`">
        <slot name="toolbar" />
        <ElDivider v-if="$slots.toolbar && showTableSetting" direction="vertical" />
        <TableSetting v-if="showTableSetting" :setting="tableSetting" @columns-change="handleColumnChange" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.basic-table-header {
  margin-bottom: 10px;
  .title-box {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &__toolbar {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    > * {
      margin-right: 8px;
    }
  }
}
</style>
