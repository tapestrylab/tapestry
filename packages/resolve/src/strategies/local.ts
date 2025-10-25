import { existsSync } from "node:fs";
import { resolve, join, dirname, extname } from "node:path";
import type { ResolverStrategy, ResolutionContext } from "../types.js";
import {
  normalizePath,
  isRelativePath,
  isAbsolutePath,
} from "../utils/normalize-path.js";

export interface LocalStrategyConfig {
  /** Root directory for resolution */
  root?: string;
  /** Alias mappings (e.g., { "@ui": "src/components" }) */
  alias?: Record<string, string>;
  /** Extensions to try when resolving (default: ['.ts', '.tsx', '.js', '.jsx']) */
  extensions?: string[];
  /** Whether to check if files exist (default: true, set to false for browser environments) */
  checkExists?: boolean;
}

/**
 * Local filesystem resolution strategy
 * Handles relative imports, absolute paths, and alias mappings
 */
export function local(config: LocalStrategyConfig = {}): ResolverStrategy {
  const root = config.root ?? process.cwd();
  const alias = config.alias ?? {};
  const extensions = config.extensions ?? [".ts", ".tsx", ".js", ".jsx"];
  const checkExists = config.checkExists ?? true;

  return {
    name: "local",
    async resolve(id: string, context?: ResolutionContext) {
      const resolveRoot = context?.root ?? root;

      // Handle alias mappings
      for (const [key, target] of Object.entries(alias)) {
        if (id === key || id.startsWith(`${key}/`)) {
          const relative = id.replace(key, target);
          const resolved = resolve(resolveRoot, relative);
          const normalized = normalizePath(resolved);

          // Try to find the actual file with extensions
          const finalPath = await tryResolveWithExtensions(
            normalized,
            extensions,
            checkExists
          );
          if (finalPath) {
            return { id, path: finalPath, source: "local" };
          }
        }
      }

      // Handle relative imports
      if (isRelativePath(id)) {
        const base = context?.importer
          ? dirname(context.importer)
          : resolveRoot;
        const resolved = resolve(base, id);
        const normalized = normalizePath(resolved);

        const finalPath = await tryResolveWithExtensions(
          normalized,
          extensions,
          checkExists
        );
        if (finalPath) {
          return { id, path: finalPath, source: "local" };
        }
      }

      // Handle absolute paths
      if (isAbsolutePath(id)) {
        const normalized = normalizePath(id);
        const finalPath = await tryResolveWithExtensions(
          normalized,
          extensions,
          checkExists
        );
        if (finalPath) {
          return { id, path: finalPath, source: "local" };
        }
      }

      return null;
    },
  };
}

/**
 * Try to resolve a path with various extensions
 */
async function tryResolveWithExtensions(
  path: string,
  extensions: string[],
  checkExists: boolean
): Promise<string | null> {
  // If path already has an extension, try it first
  if (extname(path)) {
    if (!checkExists || existsSync(path)) {
      return path;
    }
  }

  // Try each extension
  for (const ext of extensions) {
    const withExt = `${path}${ext}`;
    if (!checkExists || existsSync(withExt)) {
      return withExt;
    }
  }

  // Try as index file
  for (const ext of extensions) {
    const indexPath = join(path, `index${ext}`);
    if (!checkExists || existsSync(indexPath)) {
      return indexPath;
    }
  }

  return null;
}
