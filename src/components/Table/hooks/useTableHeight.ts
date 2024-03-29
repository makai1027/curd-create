import type { ComputedRef, Ref } from 'vue'
import { debounce as useDebounceFn } from 'lodash-es'
import type { PaginationProps } from 'element-plus'
import type { BasicTableProps } from '../types/table'
import { isBoolean, isNumber, isObject, isString } from '@/components/utils/is'
import { useWindowSizeFn } from '@/components/utils/useWindowSizeFn'
import { getViewportOffset } from '@/components/utils/domUtils'

export function useTableHeight(
  propsRef: ComputedRef<BasicTableProps>,
  tableElRef: Ref<ComponentRef>,
  wrapRef: Ref<HTMLElement | null>,
  formRef: Ref<ComponentRef>,
  getPaginationInfo: Ref<boolean | Partial<PaginationProps>>,
) {
  const tableHeightRef: Ref<Nullable<number | string>> = ref(400)

  // Greater than animation time 280
  const debounceRedoHeight = useDebounceFn(redoHeight, 100)

  const getCanResize = computed(() => {
    const { canResize, height } = unref(propsRef)
    // table 自定义height的优先级 高于 自适应高度
    if (height)
      return false
    return canResize
  })

  watch(
    () => unref(getCanResize),
    () => {
      debounceRedoHeight()
    },
    {
      flush: 'post',
    },
  )
  watch(
    () => unref(getPaginationInfo),
    (val, oval) => {
      // 关闭分页 、 开启分页
      if ((isBoolean(val) && !val && isObject(oval)) || (isBoolean(oval) && !oval && isObject(val)))
        redoHeight()
    },
  )

  function redoHeight() {
    nextTick(() => {
      calcTableHeight()
    })
  }

  function setHeight(height: number) {
    tableHeightRef.value = height
  }

  // No need to repeat queries
  let paginationEl: HTMLElement | null
  let bodyEl: HTMLElement | null

  async function calcTableHeight() {
    const { maxHeight, useSearchForm, isCanResizeParent, minHeight } = unref(propsRef)
    const pagination = unref(getPaginationInfo)
    if (!unref(getCanResize))
      return
    const wrapEl = unref(wrapRef)
    if (!wrapEl)
      return
    const table = unref(tableElRef)
    if (!table)
      return

    const tableEl: Element = table.$el
    if (!tableEl)
      return

    if (!bodyEl) {
      bodyEl = tableEl.querySelector('.el-table__inner-wrapper')
      if (!bodyEl)
        return
    }

    await nextTick()
    // table隐藏或者不存在则不需要计算
    const headEl = tableEl.querySelector('.el-table__header')
    if (!headEl)
      return

    // BasicTable的padding高度
    let paddingHeight = 16
    // 分页器所占高度
    let paginationHeight = 2
    if (!isBoolean(pagination)) {
      paginationEl = wrapEl.querySelector('.el-pagination') as HTMLElement
      if (paginationEl) {
        const offsetHeight = paginationEl.offsetHeight
        // 本身高度
        paginationHeight += offsetHeight || 0
        // margin高度
        paginationHeight += 10
      }
    }

    let bottomIncludeBody = 0
    // 如果是继承父级高度
    if (unref(wrapRef) && isCanResizeParent) {
      const formMargin = 10
      let headerMargin = 10
      const wrapHeight = unref(wrapRef)?.offsetHeight ?? 0

      let formHeight = unref(formRef)?.$el.offsetHeight ?? 0
      if (formHeight)
        formHeight += formMargin

      if (isBoolean(useSearchForm) && !useSearchForm)
        paddingHeight = 0

      const headerCellHeight = (wrapEl.querySelector('.basic-table-header') as HTMLElement)?.offsetHeight ?? 0
      if (!headerCellHeight)
        headerMargin = 0

      bottomIncludeBody = wrapHeight - formHeight - headerCellHeight - paginationHeight - headerMargin
    }
    else {
      // Table height from bottom
      bottomIncludeBody = getViewportOffset(headEl).bottomIncludeBody
    }

    let height = bottomIncludeBody - paddingHeight - paginationHeight

    const _max = isString(maxHeight) ? Number(maxHeight.replace('px', '') || 0) : maxHeight
    const _min = isString(minHeight) ? Number(minHeight.replace('px', '') || 0) : minHeight

    if (_min && _max && _min > _max)
      height = height + 0

    if (_max && _max < height)
      height = _max

    if (_min && _min > height)
      height = _min

    setHeight(height)
    bodyEl!.style.height = `${height}px`
  }
  useWindowSizeFn<Promise<void>>(calcTableHeight, 280)

  onMounted(() => {
    calcTableHeight()
    nextTick(() => {
      debounceRedoHeight()
    })
  })

  onActivated(() => {
    calcTableHeight()
    nextTick(() => {
      debounceRedoHeight()
    })
  })

  const getTableHeightRef = computed(() => {
    const tableHeight = unref(tableHeightRef)
    const { canResize, height } = unref(propsRef)

    if (height) {
      if (isNumber(height) || (isString(height) && (height.includes('px') || /\d+$/.test(height))))
        return parseInt(height)
    }

    return canResize ? tableHeight : 'auto'
  })

  return { getTableHeightRef, redoHeight }
}
