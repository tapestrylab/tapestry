import { z } from "zod";

/**
 * Source of the resolved entry
 */
export type ResolvedSource = "local" | "cdn" | "remote";

/**
 * A resolved entry containing the path/URL to the resource
 */
export interface ResolvedEntry {
  /** Original import identifier */
  id: string;
  /** Resolved path or URL */
  path: string;
  /** Source type of the resolution */
  source?: ResolvedSource;
}

/**
 * Strategy interface for resolving module identifiers
 */
export interface ResolverStrategy {
  /** Name of the strategy (for debugging) */
  name: string;
  /** Resolve the given identifier, return null if unable to resolve */
  resolve(id: string, context?: ResolutionContext): Promise<ResolvedEntry | null>;
}

/**
 * Context information for resolution
 */
export interface ResolutionContext {
  /** Project root directory */
  root?: string;
  /** Current file being processed (for relative imports) */
  importer?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for the Resolver
 */
export interface ResolverConfig {
  /** Array of resolution strategies to try in order */
  strategies?: ResolverStrategy[];
  /** Enable/disable caching of resolved entries */
  cache?: boolean;
  /** Resolution context */
  context?: ResolutionContext;
}

/**
 * Zod schemas for validation
 */
export const ResolvedEntrySchema = z.object({
  id: z.string(),
  path: z.string(),
  source: z.enum(["local", "cdn", "remote"]).optional(),
});

export const ResolverConfigSchema = z.object({
  strategies: z.array(z.any()).optional(),
  cache: z.boolean().optional(),
  context: z.object({
    root: z.string().optional(),
    importer: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
});
