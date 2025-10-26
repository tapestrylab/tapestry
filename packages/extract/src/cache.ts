import * as fs from "node:fs/promises";
import type { ExtractedMetadata } from "./types.js";

/**
 * Cache for extraction results to avoid re-parsing unchanged files
 */
export interface ExtractionCache {
  /**
   * Get cached metadata for a file if it hasn't been modified
   */
  get(filePath: string): Promise<ExtractedMetadata[] | null>;

  /**
   * Store metadata for a file
   */
  set(filePath: string, metadata: ExtractedMetadata[]): Promise<void>;

  /**
   * Clear the entire cache
   */
  clear(): void;

  /**
   * Remove a specific file from cache
   */
  delete(filePath: string): void;

  /**
   * Get cache size
   */
  size(): number;
}

/**
 * Create a new extraction cache instance
 */
export const createExtractionCache = (): ExtractionCache => {
  const cache = new Map<
    string,
    {
      mtime: number;
      metadata: ExtractedMetadata[];
    }
  >();

  return {
    async get(filePath: string): Promise<ExtractedMetadata[] | null> {
      const cached = cache.get(filePath);
      if (!cached) {
        return null;
      }

      try {
        const stats = await fs.stat(filePath);
        if (stats.mtimeMs > cached.mtime) {
          // File was modified, invalidate cache
          cache.delete(filePath);
          return null;
        }

        return cached.metadata;
      } catch {
        // File doesn't exist or can't be accessed
        cache.delete(filePath);
        return null;
      }
    },

    async set(
      filePath: string,
      metadata: ExtractedMetadata[]
    ): Promise<void> {
      try {
        const stats = await fs.stat(filePath);
        cache.set(filePath, {
          mtime: stats.mtimeMs,
          metadata,
        });
      } catch {
        // Ignore errors when caching
      }
    },

    clear(): void {
      cache.clear();
    },

    delete(filePath: string): void {
      cache.delete(filePath);
    },

    size(): number {
      return cache.size;
    },
  };
};
