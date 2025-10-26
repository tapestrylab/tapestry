/**
 * Documentation theme for @tapestrylab/template
 */

import type { TapestryTheme } from '../src/types-theme';

const theme: TapestryTheme = {
  components: {
    propsTable: {
      styles: {
        table: 'w-full border-collapse',
        header: 'bg-blue-50 text-left',
        row: 'border-t',
        cell: 'px-6 py-3',
      },
    },
    tabs: {
      styles: {
        container: 'my-6',
        tabList: 'flex gap-2 border-b-2',
        tab: 'px-6 py-3 text-gray-600 hover:text-gray-900 transition',
        activeTab: 'px-6 py-3 border-b-2 border-blue-600 text-blue-600 font-medium',
        panel: 'p-6',
      },
    },
    accordion: {
      styles: {
        container: 'space-y-2',
        item: 'border border-gray-200 rounded-lg overflow-hidden',
        header: 'w-full px-6 py-4 text-left font-medium hover:bg-gray-50 transition',
        content: 'px-6 py-4 bg-gray-50 border-t',
      },
    },
    callout: {
      styles: {
        container: 'my-6 p-6 rounded-lg border-l-4 bg-opacity-10',
        icon: 'mr-3 text-2xl',
        content: 'text-sm leading-relaxed',
      },
    },
    codeBlock: {
      styles: {
        container: 'my-6',
        pre: 'bg-gray-950 text-gray-100 rounded-xl p-6 overflow-x-auto shadow-lg',
        code: 'font-mono text-sm leading-relaxed',
      },
      props: {
        showLineNumbers: false,
      },
    },
  },
  global: {
    fontFamily: 'Inter, system-ui, sans-serif',
    accentColor: '#2563eb',
    borderRadius: '12px',
  },
};

export default theme;
