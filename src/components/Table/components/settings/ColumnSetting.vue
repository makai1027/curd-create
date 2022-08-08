<template>
  <ElTooltip placement="top" content="列设置">
    <ElPopover
      placement="bottom-start"
      trigger="click"
      @show="handleVisibleChange"
      :popper-class="`${prefixCls}__cloumn-list`"
    >
      <template #reference>
        <div :class="`${prefixCls}__popover-title`">
          <ElCheckbox :indeterminate="indeterminate" v-model="checkAll" @change="onCheckAllChange"> 列展示 </ElCheckbox>
          <ElCheckbox v-model="checkIndex" @change="handleIndexCheckChange"> 序号列 </ElCheckbox>
          <ElCheckbox v-model="checkSelect" @change="handleSelectCheckChange" :disabled="!defaultRowSelection">
            勾选列
          </ElCheckbox>

          <a-button size="small" type="link" @click="reset"> 重置 </a-button>
        </div>
      </template>

      <template #content>
        <ElScrollbar>
          <ElCheckboxGroup v-model="checkedList" @change="onChange" ref="columnListRef">
            <template v-for="item in plainOptions" :key="item.value">
              <div :class="`${prefixCls}__check-item`" v-if="!('ifShow' in item && !item.ifShow)">
                <el-icon class="table-column-drag-icon"><Rank /></el-icon>
                <ElCheckbox :label="item.value">
                  {{ item.label }}
                </ElCheckbox>

                <ElTooltip placement="bottom-start" :mouseLeaveDelay="0.4" content="固定到左侧">
                  <el-icon
                    :class="[
                      `${prefixCls}__fixed-left`,
                      {
                        active: item.fixed === 'left',
                        disabled: !checkedList.includes(item.value)
                      }
                    ]"
                    @click="handleColumnFixed(item, 'left')"
                  >
                    <ArrowLeft />
                  </el-icon>
                </ElTooltip>
                <ElDivider direction="vertical" />
                <ElTooltip placement="bottom-start" :mouseLeaveDelay="0.4" content="固定到右侧">
                  <el-icon
                    :class="[
                      `${prefixCls}__fixed-right`,
                      {
                        active: item.fixed === 'right',
                        disabled: !checkedList.includes(item.value)
                      }
                    ]"
                    @click="handleColumnFixed(item, 'right')"
                  >
                    <ArrowRight />
                  </el-icon>
                </ElTooltip>
              </div>
            </template>
          </ElCheckboxGroup>
        </ElScrollbar>
      </template>
      <el-icon><Setting /></el-icon>
    </ElPopover>
  </ElTooltip>
</template>
<script lang="ts">
import type { BasicColumn, ColumnChangeParam } from '../../types/table'
import { defineComponent, ref, reactive, toRefs, watchEffect, nextTick, unref, computed } from 'vue'
import { ElTooltip, ElPopover, ElCheckbox, ElDivider, ElIcon, ElScrollbar } from 'element-plus'

import { Setting, Rank, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { useTableContext } from '../../hooks/useTableContext'
import { isNullAndUnDef } from '@/components/utils/is'
import { cloneDeep, omit } from 'lodash-es'
import Sortablejs from 'sortablejs'
import type Sortable from 'sortablejs'
import { CheckboxValueType } from 'element-plus'

interface State {
  checkAll: boolean
  isInit?: boolean
  checkedList: string[]
  defaultCheckList: string[]
}

interface Options {
  label: string
  value: string
  fixed?: boolean | 'left' | 'right'
}

export default defineComponent({
  name: 'ColumnSetting',
  components: {
    Rank,
    ElPopover,
    ElTooltip,
    ElCheckbox,
    ElCheckboxGroup: ElCheckbox.Group,
    ElDivider,
    Setting,
    ElIcon,
    ArrowLeft,
    ArrowRight,
    ElScrollbar
  },
  emits: ['columns-change'],

  setup(_, { emit, attrs }) {
    const table = useTableContext()

    const defaultRowSelection = omit(table.getRowSelection(), 'selectedRowKeys')
    let inited = false

    const cachePlainOptions = ref<Options[] | any>([])
    const plainOptions = ref<Options[] | any>([])

    const plainSortOptions = ref<Options[] | any>([])

    const columnListRef = ref<ComponentRef>(null)

    const state = reactive<State>({
      checkAll: true,
      checkedList: [],
      defaultCheckList: []
    })

    const checkIndex = ref(false)
    const checkSelect = ref(false)

    const prefixCls = 'basic-column-setting'

    const getValues = computed(() => {
      return unref(table?.getBindValues) || {}
    })

    watchEffect(() => {
      setTimeout(() => {
        const columns = table.getColumns()
        if (columns.length && !state.isInit) {
          init()
        }
      }, 0)
    })

    watchEffect(() => {
      const values = unref(getValues)
      checkIndex.value = !!values.showIndexColumn
      checkSelect.value = !!values.showCheckColumn
    })

    function getColumns() {
      const ret: Array<Recordable> = []
      table.getColumns({ ignoreIndex: true, ignoreAction: true }).forEach((item) => {
        ret.push({
          label: (item.label as string) || (item.customTitle as unknown as string),
          value: (item.prop || item.label) as string,
          ...item
        })
      })
      return ret
    }

    function init() {
      const columns = getColumns()

      const checkList = table
        .getColumns({ ignoreAction: true })
        .map((item) => {
          if (item.defaultHidden) {
            return ''
          }
          return item.prop || item.label
        })
        .filter(Boolean) as string[]

      if (!plainOptions.value.length) {
        plainOptions.value = columns
        plainSortOptions.value = columns
        cachePlainOptions.value = columns
        state.defaultCheckList = checkList
      } else {
        // const fixedColumns = columns.filter((item) =>
        //   Reflect.has(item, 'fixed')
        // ) as BasicColumn[];

        unref(plainOptions).forEach((item: BasicColumn) => {
          const findItem = columns.find((col: BasicColumn) => col.prop === item.prop)
          if (findItem) {
            item.fixed = findItem.fixed
          }
        })
      }
      state.isInit = true
      state.checkedList = checkList
    }

    // checkAll change
    function onCheckAllChange(val: CheckboxValueType) {
      const checkList = plainOptions.value.map((item: any) => item.value)
      if (val) {
        state.checkedList = checkList
        setColumns(checkList)
      } else {
        state.checkedList = []
        setColumns([])
      }
    }

    const indeterminate = computed(() => {
      const len = plainOptions.value.length
      let checkedLen = state.checkedList.length
      unref(checkIndex) && checkedLen--
      return checkedLen > 0 && checkedLen < len
    })

    // Trigger when check/uncheck a column
    function onChange(checkedList: string[]) {
      const len = plainSortOptions.value.length
      state.checkAll = checkedList.length === len
      const sortList = unref(plainSortOptions).map((item: any) => item.value)
      checkedList.sort((prev, next) => {
        return sortList.indexOf(prev) - sortList.indexOf(next)
      })
      setColumns(checkedList)
    }

    let sortable: Sortable
    let sortableOrder: string[] = []
    // reset columns
    function reset() {
      state.checkedList = [...state.defaultCheckList]
      state.checkAll = true
      plainOptions.value = unref(cachePlainOptions)
      plainSortOptions.value = unref(cachePlainOptions)
      setColumns(table.getCacheColumns())
      sortable.sort(sortableOrder)
    }

    // Open the pop-up window for drag and drop initialization
    function handleVisibleChange() {
      if (inited) return
      nextTick(() => {
        const columnListEl = unref(columnListRef)
        if (!columnListEl) return
        const el = columnListEl.$el as any
        if (!el) return
        // Drag and drop sort
        sortable = Sortablejs.create(unref(el), {
          animation: 500,
          delay: 400,
          delayOnTouchOnly: true,
          handle: '.table-column-drag-icon ',
          onEnd: (evt) => {
            const { oldIndex, newIndex } = evt
            if (isNullAndUnDef(oldIndex) || isNullAndUnDef(newIndex) || oldIndex === newIndex) {
              return
            }
            // Sort column
            const columns = cloneDeep(plainSortOptions.value)

            if (oldIndex > newIndex) {
              columns.splice(newIndex, 0, columns[oldIndex])
              columns.splice(oldIndex + 1, 1)
            } else {
              columns.splice(newIndex + 1, 0, columns[oldIndex])
              columns.splice(oldIndex, 1)
            }

            plainSortOptions.value = columns

            setColumns(
              columns.map((col: Options) => col.value).filter((value: string) => state.checkedList.includes(value))
            )
          }
        })
        // 记录原始order 序列
        sortableOrder = sortable.toArray()
        inited = true
      })
    }

    // Control whether the serial number column is displayed
    function handleIndexCheckChange(val: CheckboxValueType) {
      table.setProps({
        showIndexColumn: val as boolean
      })
    }

    // Control whether the check box is displayed
    function handleSelectCheckChange(val: CheckboxValueType) {
      table.setProps({
        showCheckColumn: val as boolean
      })
    }

    function handleColumnFixed(item: BasicColumn, fixed?: 'left' | 'right') {
      if (!state.checkedList.includes(item.prop as string)) return

      const columns = getColumns() as BasicColumn[]
      const isFixed = item.fixed === fixed ? false : fixed
      const index = columns.findIndex((col) => col.prop === item.prop)
      if (index !== -1) {
        columns[index].fixed = isFixed
      }
      item.fixed = isFixed

      if (isFixed && !item.width) {
        item.width = 100
      }
      table.setCacheColumnsByField?.(item.prop as string, { fixed: isFixed })
      setColumns(columns)
    }

    function setColumns(columns: BasicColumn[] | string[]) {
      table.setColumns(columns)
      const data: ColumnChangeParam[] = unref(plainSortOptions).map((col: any) => {
        const visible =
          columns.findIndex(
            (c: BasicColumn | string) => c === col.value || (typeof c !== 'string' && c.prop === col.value)
          ) !== -1
        return { dataIndex: col.value, fixed: col.fixed, visible }
      })

      emit('columns-change', data)
    }

    return {
      ...toRefs(state),
      indeterminate,
      onCheckAllChange,
      onChange,
      plainOptions,
      reset,
      prefixCls,
      columnListRef,
      handleVisibleChange,
      checkIndex,
      checkSelect,
      handleIndexCheckChange,
      handleSelectCheckChange,
      defaultRowSelection,
      handleColumnFixed
    }
  }
})
</script>
<style lang="less">
.table-column-drag-icon {
  margin: 0 5px;
  cursor: move;
}

.basic-column-setting {
  &__popover-title {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__check-item {
    display: flex;
    align-items: center;
    min-width: 100%;
    padding: 4px 16px 8px 0;

    .ant-checkbox-wrapper {
      width: 100%;

      &:hover {
        // color: @primary-color;
      }
    }
  }

  &__fixed-left,
  &__fixed-right {
    color: rgb(0 0 0 / 45%);
    cursor: pointer;

    &.active,
    &:hover {
      // color: @primary-color;
    }

    &.disabled {
      // color: @disabled-color;
      cursor: not-allowed;
    }
  }

  &__fixed-right {
    transform: rotate(180deg);
  }

  &__cloumn-list {
    svg {
      width: 1em !important;
      height: 1em !important;
    }

    .ant-popover-inner-content {
      // max-height: 360px;
      padding-right: 0;
      padding-left: 0;
      // overflow: auto;
    }

    .ant-checkbox-group {
      width: 100%;
      min-width: 260px;
      // flex-wrap: wrap;
    }

    .scrollbar {
      height: 220px;
    }
  }
}
</style>