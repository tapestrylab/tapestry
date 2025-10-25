/**
 * @tapestrylab/template - Template engine for generating structured component documentation
 *
 * Main exports for the template package
 */

// Core types
export type {
  // From @tapestrylab/extract
  ComponentMetadata,
  PropMetadata,
  ExtractResult,
  ExtractConfig,
  // Template types
  Template,
  TemplateMetadata,
  Block,
  BaseBlock,
  HeadingBlock,
  ParagraphBlock,
  DividerBlock,
  CodeBlock,
  CodeBlocksBlock,
  PropsTableBlock,
  ApiReferenceBlock,
  CalloutBlock,
  TabsBlock,
  AccordionBlock,
  UsageSitesBlock,
  DependencyListBlock,
  DependentsBlock,
  LinkListBlock,
  // Data types
  TemplateDataContext,
  EnrichedComponentData,
  UsageSite,
  Dependency,
  Dependent,
  // Render types
  RenderContext,
  RenderResult,
} from './types';

// Theme types
export type {
  TapestryTheme,
  ComponentMapping,
  ComponentMappingConfig,
  StyleConfig,
  GlobalThemeConfig,
  ResolvedTheme,
  ResolvedComponentMapping,
} from './types-theme';

// Template Builder
export { TemplateBuilder, createTemplate } from './template-builder';

// Template Matcher
export { matchTemplate, matchTemplates } from './matcher';
export type { TemplateMatchRule } from './matcher';

// Renderers
export { renderMarkdown } from './renderer-markdown';
export { renderMDX } from './renderer-mdx';

// Theme Resolver
export {
  loadTheme,
  resolveTheme,
  mergeThemes,
  getComponentMapping,
  defaultTheme,
} from './theme-resolver';

// Generator
export {
  generate,
  generateAll,
  extractAndResolve,
} from './generator';
export type { GenerateConfig, GenerateAllConfig } from './generator';

// Extract & Resolve Wrappers
export { extractComponents, extractComponent } from './extract-wrapper';
export { resolveRelationships, resolveRelationshipsForAll } from './resolve-wrapper';

// Interpolation utilities
export {
  interpolate,
  getByPath,
  evaluateCondition,
  shouldRenderBlock,
} from './interpolate';

// Re-export from @tapestrylab/extract for convenience
export { extract } from '@tapestrylab/extract';
