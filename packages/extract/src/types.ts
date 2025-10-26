import { z } from "zod";

// Default configuration values
export const DEFAULT_INCLUDE = [
  '**/*.tsx',
  '**/*.ts',
  '**/*.jsx',
  '**/*.js',
];

export const DEFAULT_EXCLUDE = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/*.d.ts',
];

// Configuration schema with optional fields and smart defaults
export const ExtractConfigSchema = z.object({
  root: z.string().default(process.cwd()),
  include: z.array(z.string()).default(DEFAULT_INCLUDE),
  exclude: z.array(z.string()).default(DEFAULT_EXCLUDE),
  output: z.string().optional(),
  plugins: z.array(z.string()).optional(),
  extractors: z.record(z.string(), z.any()).optional(),
  errorHandling: z.enum(['collect', 'throw', 'ignore']).default('collect'),
  cache: z.boolean().default(false),
});

export type ExtractConfig = z.infer<typeof ExtractConfigSchema>;

export type ErrorCallback = (error: ExtractError) => void;

// Extracted metadata types
export interface ComponentMetadata {
  type: "component";
  name: string;
  filePath: string;
  exportType: "default" | "named";
  props: PropMetadata[];

  // JSDoc fields - commonly used ones at top level
  description?: string;
  deprecated?: string | boolean;  // @deprecated - true if no message, string if message provided
  returns?: string;               // @returns description
  links?: string[];               // @see references (parsed from @see JSDoc tags)
  since?: string;                 // @since version
  examples?: string[];            // @example - component-level usage examples

  // Type extensions/inheritance
  extends?: string[];             // Type references that couldn't be expanded inline (e.g., "ButtonHTMLAttributes<HTMLButtonElement>")
}

export interface PropMetadata {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;  // Enhanced from @param tags in JSDoc
  examples?: string[];   // Generated from type + JSDoc examples
}

export type ExtractedMetadata = ComponentMetadata;

export interface ExtractResult {
  metadata: ExtractedMetadata[];
  errors: ExtractError[];
  stats: {
    filesScanned: number;
    filesProcessed: number;
    componentsFound: number;
    duration: number;
  };
}

export interface ExtractError {
  filePath: string;
  message: string;
  line?: number;
  column?: number;
}

// Plugin system types with lifecycle hooks
export interface ExtractorPlugin {
  name: string;

  // Core extraction
  test?: (filePath: string) => boolean;
  extract?: (filePath: string, content: string) => Promise<ExtractedMetadata[]>;

  // Lifecycle hooks
  beforeScan?: (config: ExtractConfig) => void | Promise<void>;
  afterScan?: (files: string[]) => string[] | Promise<string[]>;
  afterExtract?: (metadata: ExtractedMetadata) => ExtractedMetadata | Promise<ExtractedMetadata>;
  afterAll?: (metadata: ExtractedMetadata[], config: ExtractConfig) => ExtractedMetadata[] | Promise<ExtractedMetadata[]>;
}

// Custom error class for extraction failures
export class ExtractionError extends Error {
  constructor(message: string, public errors: ExtractError[]) {
    super(message);
    this.name = 'ExtractionError';
  }
}
