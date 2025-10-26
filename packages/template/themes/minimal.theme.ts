/**
 * Minimal theme for @tapestrylab/template
 */

import type { TapestryTheme } from '../src/types-theme';

const theme: TapestryTheme = {
  components: {
    propsTable: {
      styles: {
        table: '',
        header: '',
        row: '',
        cell: '',
      },
    },
    tabs: {
      styles: {
        container: '',
        tabList: '',
        tab: '',
        activeTab: '',
        panel: '',
      },
    },
    accordion: {
      styles: {
        container: '',
        item: '',
        header: '',
        content: '',
      },
    },
    callout: {
      styles: {
        container: '',
        icon: '',
        content: '',
      },
    },
  },
  global: {
    fontFamily: 'monospace',
    accentColor: '#000000',
    borderRadius: '0',
  },
};

export default theme;
