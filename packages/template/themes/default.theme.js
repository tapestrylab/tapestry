/**
 * Default theme for @tapestrylab/template
 */

export default {
  components: {
    propsTable: {
      styles: {
        table: 'border-collapse border border-gray-300',
        header: 'bg-gray-100',
        row: 'border-b border-gray-200',
        cell: 'px-4 py-2',
      },
    },
    tabs: {
      styles: {
        container: 'border rounded-lg',
        tabList: 'flex border-b',
        tab: 'px-4 py-2 cursor-pointer hover:bg-gray-100',
        activeTab: 'px-4 py-2 border-b-2 border-blue-500 font-semibold',
        panel: 'p-4',
      },
    },
    accordion: {
      styles: {
        container: 'border rounded-lg',
        item: 'border-b last:border-b-0',
        header: 'px-4 py-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center',
        content: 'px-4 py-3 bg-gray-50',
      },
    },
    callout: {
      styles: {
        container: 'p-4 rounded-lg border-l-4',
        icon: 'mr-2',
        content: 'flex-1',
      },
    },
    codeBlock: {
      styles: {
        container: 'my-4',
        pre: 'bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto',
        code: 'font-mono text-sm',
      },
    },
  },
  global: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    accentColor: '#3b82f6',
    borderRadius: '8px',
  },
};
