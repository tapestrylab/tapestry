/**
 * Tests for theme resolver functions
 */

import { describe, it, expect } from 'vitest';
import { mergeThemes, deepMergeThemes, resolveTheme, defaultTheme } from './theme-resolver';
import type { TapestryTheme } from './types-theme';

describe('theme-resolver', () => {
  describe('mergeThemes (shallow merge)', () => {
    it('should merge themes with shallow merge at component level', () => {
      const theme1: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              table: 'border',
              header: 'bg-gray-100',
            },
          },
        },
        global: {
          fontFamily: 'Arial',
        },
      };

      const theme2: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              header: 'bg-blue-100',
            },
          },
        },
        global: {
          accentColor: '#ff0000',
        },
      };

      const merged = mergeThemes(theme1, theme2);

      // Component should be replaced entirely (shallow merge)
      expect(merged.components?.propsTable).toEqual({
        styles: {
          header: 'bg-blue-100',
        },
      });

      // Global should be shallow merged
      expect(merged.global).toEqual({
        fontFamily: 'Arial',
        accentColor: '#ff0000',
      });
    });

    it('should merge multiple themes in order', () => {
      const theme1: TapestryTheme = {
        global: { fontFamily: 'Arial' },
      };
      const theme2: TapestryTheme = {
        global: { accentColor: '#ff0000' },
      };
      const theme3: TapestryTheme = {
        global: { borderRadius: '4px' },
      };

      const merged = mergeThemes(theme1, theme2, theme3);

      expect(merged.global).toEqual({
        fontFamily: 'Arial',
        accentColor: '#ff0000',
        borderRadius: '4px',
      });
    });

    it('should handle empty themes', () => {
      const theme1: TapestryTheme = {
        components: {},
        global: {},
      };

      const merged = mergeThemes(theme1);

      expect(merged).toEqual({
        components: {},
        global: {},
      });
    });
  });

  describe('deepMergeThemes', () => {
    it('should deep merge nested component properties', () => {
      const theme1: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              table: 'border',
              header: 'bg-gray-100',
              row: 'border-b',
            },
          },
        },
      };

      const theme2: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              header: 'bg-blue-100', // Override only header
            },
          },
        },
      };

      const merged = deepMergeThemes(theme1, theme2);

      // Should preserve table and row, override header
      expect(merged.components?.propsTable).toEqual({
        styles: {
          table: 'border',
          header: 'bg-blue-100',
          row: 'border-b',
        },
      });
    });

    it('should deep merge multiple levels of nesting', () => {
      const theme1: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              table: 'border',
              header: 'bg-gray-100',
            },
            props: {
              showTypes: true,
            },
          },
          tabs: {
            styles: {
              container: 'border',
            },
          },
        },
      };

      const theme2: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              header: 'bg-blue-100',
            },
            props: {
              showDefaults: true,
            },
          },
        },
      };

      const merged = deepMergeThemes(theme1, theme2);

      expect(merged.components?.propsTable).toEqual({
        styles: {
          table: 'border',
          header: 'bg-blue-100',
        },
        props: {
          showTypes: true,
          showDefaults: true,
        },
      });

      // tabs should be preserved
      expect(merged.components?.tabs).toEqual({
        styles: {
          container: 'border',
        },
      });
    });

    it('should deep merge global properties', () => {
      const theme1: TapestryTheme = {
        global: {
          fontFamily: 'Arial',
          accentColor: '#ff0000',
          customProp: 'value1',
        },
      };

      const theme2: TapestryTheme = {
        global: {
          accentColor: '#0000ff',
          borderRadius: '8px',
        },
      };

      const merged = deepMergeThemes(theme1, theme2);

      expect(merged.global).toEqual({
        fontFamily: 'Arial',
        accentColor: '#0000ff',
        customProp: 'value1',
        borderRadius: '8px',
      });
    });

    it('should handle arrays by replacing them', () => {
      const theme1: TapestryTheme = {
        global: {
          customArray: [1, 2, 3] as any,
        },
      };

      const theme2: TapestryTheme = {
        global: {
          customArray: [4, 5] as any,
        },
      };

      const merged = deepMergeThemes(theme1, theme2);

      // Arrays should be replaced, not merged
      expect(merged.global?.customArray).toEqual([4, 5]);
    });

    it('should merge multiple themes in order with deep merge', () => {
      const theme1: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              table: 'border',
              header: 'bg-gray-100',
            },
          },
        },
      };

      const theme2: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              header: 'bg-blue-100',
            },
          },
        },
      };

      const theme3: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              row: 'border-b',
            },
          },
        },
      };

      const merged = deepMergeThemes(theme1, theme2, theme3);

      expect(merged.components?.propsTable).toEqual({
        styles: {
          table: 'border',
          header: 'bg-blue-100',
          row: 'border-b',
        },
      });
    });

    it('should handle null and undefined values', () => {
      const theme1: TapestryTheme = {
        global: {
          fontFamily: 'Arial',
          accentColor: '#ff0000',
        },
      };

      const theme2: TapestryTheme = {
        global: {
          accentColor: undefined as any,
        },
      };

      const merged = deepMergeThemes(theme1, theme2);

      // undefined should override
      expect(merged.global?.accentColor).toBeUndefined();
      expect(merged.global?.fontFamily).toBe('Arial');
    });
  });

  describe('resolveTheme', () => {
    it('should merge custom theme with default theme', () => {
      const customTheme: TapestryTheme = {
        global: {
          accentColor: '#ff0000',
        },
      };

      const resolved = resolveTheme(customTheme);

      expect(resolved.global.accentColor).toBe('#ff0000');
      expect(resolved.global.fontFamily).toBe(defaultTheme.global?.fontFamily);
    });

    it('should handle undefined custom theme', () => {
      const resolved = resolveTheme();

      expect(resolved.global).toEqual(defaultTheme.global);
    });

    it('should convert to Map structure', () => {
      const customTheme: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              table: 'border',
            },
          },
        },
      };

      const resolved = resolveTheme(customTheme);

      expect(resolved.components).toBeInstanceOf(Map);
      expect(resolved.components.has('propsTable')).toBe(true);
    });
  });

  describe('integration example', () => {
    it('should demonstrate shallow merge vs deep merge', () => {
      const baseTheme: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              table: 'border-collapse border',
              header: 'bg-gray-100',
              row: 'border-b',
              cell: 'px-4 py-2',
            },
          },
        },
      };

      const customizationA: TapestryTheme = {
        components: {
          propsTable: {
            styles: {
              header: 'bg-blue-100',
            },
          },
        },
      };

      // Shallow merge - replaces entire propsTable config
      const shallow = mergeThemes(baseTheme, customizationA);
      expect(shallow.components?.propsTable).toEqual({
        styles: {
          header: 'bg-blue-100',
        },
      });

      // Deep merge - preserves other styles
      const deep = deepMergeThemes(baseTheme, customizationA);
      expect(deep.components?.propsTable).toEqual({
        styles: {
          table: 'border-collapse border',
          header: 'bg-blue-100',
          row: 'border-b',
          cell: 'px-4 py-2',
        },
      });
    });
  });
});
