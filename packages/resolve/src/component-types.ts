import { z } from "zod";

/**
 * Prop documentation extracted from component
 */
export interface PropDoc {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
}

/**
 * Example code for component documentation
 */
export interface ExampleDoc {
  title?: string;
  description?: string;
  code: string;
  language?: string;
}

/**
 * Sandbox configuration for interactive examples
 */
export interface SandboxConfig {
  /** Code to execute in sandbox */
  code: string;
  /** External dependencies (npm packages) */
  dependencies?: Record<string, string>;
  /** Files to include in sandbox */
  files?: Record<string, string>;
  /** Template to use (react, vue, etc.) */
  template?: string;
}

/**
 * Complete component documentation
 */
export interface ComponentDoc {
  /** Component name */
  name: string;
  /** Component description */
  description?: string;
  /** File path of the component */
  filePath: string;
  /** Prop documentation */
  props?: PropDoc[];
  /** Usage examples */
  examples?: ExampleDoc[];
  /** Import statements used by the component */
  imports?: string[];
  /** Server-side rendered HTML preview */
  previewHtml?: string;
  /** Optional interactive sandbox configuration */
  sandbox?: SandboxConfig;
}

/**
 * Options for resolving component documentation
 */
export interface ResolveOptions {
  /** Path to the component entry file */
  entry: string;
  /** Whether to render SSR preview HTML */
  renderPreview?: boolean;
  /** Whether to generate sandbox configuration */
  sandbox?: boolean;
  /** Custom render function for SSR */
  renderFunction?: (component: any) => string;
  /** Props to pass to component during preview render */
  previewProps?: Record<string, any>;
}

/**
 * Zod schemas for validation
 */
export const PropDocSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.string().optional(),
});

export const ExampleDocSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  code: z.string(),
  language: z.string().optional(),
});

export const SandboxConfigSchema = z.object({
  code: z.string(),
  dependencies: z.record(z.string(), z.string()).optional(),
  files: z.record(z.string(), z.string()).optional(),
  template: z.string().optional(),
});

export const ComponentDocSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  filePath: z.string(),
  props: z.array(PropDocSchema).optional(),
  examples: z.array(ExampleDocSchema).optional(),
  imports: z.array(z.string()).optional(),
  previewHtml: z.string().optional(),
  sandbox: SandboxConfigSchema.optional(),
});

export const ResolveOptionsSchema = z.object({
  entry: z.string(),
  renderPreview: z.boolean().optional(),
  sandbox: z.boolean().optional(),
  renderFunction: z.function().optional(),
  previewProps: z.record(z.string(), z.any()).optional(),
});
