import * as fs from "node:fs/promises";
import type { ExtractedMetadata } from "./types.js";

/**
 * Cache for extraction results to avoid re-parsing unchanged files
 */
export class ExtractionCache {
  private cache = new Map<
    string,
    {
      mtime: number;
      metadata: ExtractedMetadata[];
    }
  >();

  /**
   * Get cached metadata for a file if it hasn't been modified
   */
  async get(filePath: string): Promise<ExtractedMetadata[] | null> {
    const cached = this.cache.get(filePath);
    if (!cached) {
      return null;
    }

    try {
      const stats = await fs.stat(filePath);
      if (stats.mtimeMs > cached.mtime) {
        // File was modified, invalidate cache
        this.cache.delete(filePath);
        return null;
      }

      return cached.metadata;
    } catch {
      // File doesn't exist or can't be accessed
      this.cache.delete(filePath);
      return null;
    }
  }

  /**
   * Store metadata for a file
   */
  async set(
    filePath: string,
    metadata: ExtractedMetadata[]
  ): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      this.cache.set(filePath, {
        mtime: stats.mtimeMs,
        metadata,
      });
    } catch {
      // Ignore errors when caching
    }
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove a specific file from cache
   */
  delete(filePath: string): void {
    this.cache.delete(filePath);
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }
}
