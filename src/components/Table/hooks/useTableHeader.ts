import type { ComputedRef, Slots } from 'vue'
import type { BasicTableProps, InnerHandlers } from '../types/table'
import TableHeader from '../components/TableHeader.vue'
import { isString } from '@/components/utils/is'
import { getSlot } from '@/components/utils/tsxHelper'

export function useTableHeader(propsRef: ComputedRef<BasicTableProps>, slots: Slots, handlers: InnerHandlers) {
  const getHeaderProps = computed((): Recordable => {
    const { title, showTableSetting, titleHelpMessage, tableSetting } = unref(propsRef)

    const hideTitle = !slots.tableTitle && !title && !slots.toolbar && !showTableSetting
    if (hideTitle && !isString(title))
      return {}

    return {
      title: hideTitle
        ? null
        : () =>
            h(
              TableHeader,
              {
                title,
                titleHelpMessage,
                showTableSetting,
                tableSetting,
                onColumnsChange: handlers.onColumnsChange,
              } as Recordable,
              {
                ...(slots.toolbar
                  ? {
                      toolbar: () => getSlot(slots, 'toolbar'),
                    }
                  : {}),
                ...(slots.tableTitle
                  ? {
                      tableTitle: () => getSlot(slots, 'tableTitle'),
                    }
                  : {}),
                ...(slots.headerTop
                  ? {
                      headerTop: () => getSlot(slots, 'headerTop'),
                    }
                  : {}),
              },
            ),
    }
  })

  const getHeaderSlots = computed(() => {
    return Object.keys(slots).filter(name => ['toolbar', 'headerTop', 'tableTitle'].includes(name))
  })
  return { getHeaderProps, getHeaderSlots }
}
