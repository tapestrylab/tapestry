/**
 * Theme system type definitions for @tapestrylab/template
 */

/**
 * Style configuration for a component
 */
export interface StyleConfig {
  [key: string]: string; // CSS class names or inline styles
}

/**
 * Component mapping options
 */
export interface ComponentMappingConfig {
  component?: string; // Path to custom component
  styles?: StyleConfig; // Style overrides
  props?: Record<string, any>; // Default props to pass to component
}

/**
 * Component mapping - can be a string path or a configuration object
 */
export type ComponentMapping = string | ComponentMappingConfig;

/**
 * Global theme configuration
 */
export interface GlobalThemeConfig {
  fontFamily?: string;
  accentColor?: string;
  borderRadius?: string;
  [key: string]: any;
}

/**
 * Complete theme definition
 */
export interface TapestryTheme {
  components?: {
    // Text blocks
    heading?: ComponentMapping;
    paragraph?: ComponentMapping;
    divider?: ComponentMapping;

    // Code blocks
    code?: ComponentMapping;
    codeBlock?: ComponentMapping;

    // Data blocks
    propsTable?: ComponentMapping;
    apiReference?: ComponentMapping;

    // Interactive blocks
    tabs?: ComponentMapping;
    accordion?: ComponentMapping;
    callout?: ComponentMapping;

    // Relationship blocks
    usageSites?: ComponentMapping;
    dependencyList?: ComponentMapping;
    dependents?: ComponentMapping;
    linkList?: ComponentMapping;

    // Allow custom block types
    [key: string]: ComponentMapping | undefined;
  };

  global?: GlobalThemeConfig;
}

/**
 * Resolved component mapping (after theme resolution)
 */
export interface ResolvedComponentMapping {
  component?: any; // Imported component (function or class)
  styles?: StyleConfig;
  props?: Record<string, any>;
}

/**
 * Resolved theme (after loading and merging)
 */
export interface ResolvedTheme {
  components: Map<string, ResolvedComponentMapping>;
  global: GlobalThemeConfig;
}
