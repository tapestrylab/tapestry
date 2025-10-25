/**
 * Theme resolver for loading and merging themes
 */

import * as path from 'node:path';
import type { TapestryTheme, ResolvedTheme, ResolvedComponentMapping } from './types-theme';

/**
 * Default theme configuration
 */
export const defaultTheme: TapestryTheme = {
  components: {},
  global: {
    fontFamily: 'system-ui, sans-serif',
    accentColor: '#3b82f6',
    borderRadius: '4px',
  },
};

/**
 * Load a theme from a file path
 * Supports .js, .ts, .mjs, .cjs files
 */
export async function loadTheme(themePath: string): Promise<TapestryTheme> {
  try {
    const absolutePath = path.resolve(themePath);
    const themeModule = await import(absolutePath);
    const theme = themeModule.default || themeModule;

    if (!theme || typeof theme !== 'object') {
      throw new Error('Theme must export an object');
    }

    return theme as TapestryTheme;
  } catch (error) {
    throw new Error(
      `Failed to load theme from ${themePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Resolve a theme by merging custom theme with default theme
 */
export function resolveTheme(customTheme?: TapestryTheme): ResolvedTheme {
  const merged: TapestryTheme = {
    components: {
      ...defaultTheme.components,
      ...customTheme?.components,
    },
    global: {
      ...defaultTheme.global,
      ...customTheme?.global,
    },
  };

  // Convert to resolved theme format
  const components = new Map<string, ResolvedComponentMapping>();

  if (merged.components) {
    for (const [blockType, mapping] of Object.entries(merged.components)) {
      if (mapping) {
        components.set(blockType, resolveComponentMapping(mapping));
      }
    }
  }

  return {
    components,
    global: merged.global || {},
  };
}

/**
 * Resolve a component mapping to a standardized format
 */
function resolveComponentMapping(
  mapping: string | { component?: string; styles?: any; props?: any }
): ResolvedComponentMapping {
  // If it's a string, it's a component path
  if (typeof mapping === 'string') {
    return {
      component: undefined, // Would be imported in actual usage
      styles: undefined,
      props: undefined,
    };
  }

  // If it's an object, extract component, styles, and props
  return {
    component: undefined, // Would be imported in actual usage
    styles: mapping.styles,
    props: mapping.props,
  };
}

/**
 * Get component mapping from resolved theme
 */
export function getComponentMapping(
  theme: ResolvedTheme,
  blockType: string
): ResolvedComponentMapping | undefined {
  return theme.components.get(blockType);
}

/**
 * Merge multiple themes (later themes override earlier ones)
 */
export function mergeThemes(...themes: TapestryTheme[]): TapestryTheme {
  const merged: TapestryTheme = {
    components: {},
    global: {},
  };

  for (const theme of themes) {
    if (theme.components) {
      merged.components = {
        ...merged.components,
        ...theme.components,
      };
    }
    if (theme.global) {
      merged.global = {
        ...merged.global,
        ...theme.global,
      };
    }
  }

  return merged;
}
