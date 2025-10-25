/**
 * Core type definitions for @tapestrylab/template
 *
 * This package uses ComponentMetadata from @tapestrylab/extract as its data model.
 */

// Re-export types from @tapestrylab/extract
export type {
  ComponentMetadata,
  PropMetadata,
  ExtractResult,
  ExtractConfig,
} from '@tapestrylab/extract';

/**
 * Extended component data with relationship information from @tapestrylab/resolve
 */
export interface UsageSite {
  file: string;
  line: number;
  column: number;
  context?: string;
}

export interface Dependency {
  name: string;
  version?: string;
  type: 'npm' | 'local';
  path?: string;
}

export interface Dependent {
  name: string;
  filePath: string;
}

export interface EnrichedComponentData {
  // All fields from ComponentMetadata
  type: 'component';
  name: string;
  filePath: string;
  exportType: 'default' | 'named';
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: string;
    description?: string;
    examples?: string[];
  }>;
  description?: string;
  deprecated?: string | boolean;
  returns?: string;
  links?: string[];
  since?: string;
  examples?: string[];
  extends?: string[];

  // Additional fields from @tapestrylab/resolve
  usageSites?: UsageSite[];
  dependencies?: Dependency[];
  dependents?: Dependent[];
}

/**
 * Template data context - ComponentMetadata is the root data context
 */
export type TemplateDataContext = EnrichedComponentData;

/**
 * Template metadata
 */
export interface TemplateMetadata {
  name: string;
  version?: string;
  description?: string;
  outputFormat?: 'markdown' | 'mdx' | 'html';
}

/**
 * Base block interface
 */
export interface BaseBlock {
  id?: string;
  if?: string; // Conditional expression (e.g., "description", "props.length > 0")
}

/**
 * Text blocks
 */
export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  text: string;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

/**
 * Code blocks
 */
export interface CodeBlock extends BaseBlock {
  type: 'code';
  code: string;
  language?: string;
}

export interface CodeBlocksBlock extends BaseBlock {
  type: 'codeBlocks';
  dataSource: string; // JSONPath to array (e.g., "examples")
  language?: string;
}

/**
 * Data blocks
 */
export interface PropsTableBlock extends BaseBlock {
  type: 'propsTable';
  dataSource: string; // JSONPath to props array
  columns?: Array<{
    field: string;
    header: string;
  }>;
}

export interface ApiReferenceBlock extends BaseBlock {
  type: 'apiReference';
  dataSource: string;
}

/**
 * Interactive blocks
 */
export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  variant: 'info' | 'warning' | 'error' | 'success';
  text: string;
}

export interface TabsBlock extends BaseBlock {
  type: 'tabs';
  tabs: Array<{
    label: string;
    content: Block[];
  }>;
}

export interface AccordionBlock extends BaseBlock {
  type: 'accordion';
  items: Array<{
    title: string;
    content: Block[];
  }>;
}

/**
 * Relationship blocks (from @tapestrylab/resolve)
 */
export interface UsageSitesBlock extends BaseBlock {
  type: 'usageSites';
  dataSource: string; // JSONPath to usageSites array
}

export interface DependencyListBlock extends BaseBlock {
  type: 'dependencyList';
  dataSource: string; // JSONPath to dependencies array
}

export interface DependentsBlock extends BaseBlock {
  type: 'dependents';
  dataSource: string; // JSONPath to dependents array
}

export interface LinkListBlock extends BaseBlock {
  type: 'linkList';
  dataSource: string; // JSONPath to links array
}

/**
 * Union type of all block types
 */
export type Block =
  | HeadingBlock
  | ParagraphBlock
  | DividerBlock
  | CodeBlock
  | CodeBlocksBlock
  | PropsTableBlock
  | ApiReferenceBlock
  | CalloutBlock
  | TabsBlock
  | AccordionBlock
  | UsageSitesBlock
  | DependencyListBlock
  | DependentsBlock
  | LinkListBlock;

/**
 * Template structure
 */
export interface Template {
  name: string;
  version?: string;
  description?: string;
  outputFormat?: 'markdown' | 'mdx' | 'html';
  blocks: Block[];
}

/**
 * Conditional evaluation result
 */
export interface ConditionalResult {
  show: boolean;
}

/**
 * Render context
 */
export interface RenderContext {
  data: TemplateDataContext;
  theme?: any;
  outputFormat: 'markdown' | 'mdx' | 'html';
}

/**
 * Render result
 */
export interface RenderResult {
  content: string;
  metadata?: {
    title?: string;
    [key: string]: any;
  };
}
