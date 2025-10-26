import chokidar, { type FSWatcher } from "chokidar";
import { extract } from "./extractor.js";
import type { ExtractConfig, ExtractResult } from "./types.js";

export interface WatchOptions extends Partial<ExtractConfig> {
  /**
   * Callback fired when extraction completes (initial or on change)
   */
  onChange: (result: ExtractResult) => void;

  /**
   * Callback fired when a file is added
   */
  onAdd?: (filePath: string) => void;

  /**
   * Callback fired when a file is deleted
   */
  onDelete?: (filePath: string) => void;

  /**
   * Callback fired on errors
   */
  onError?: (error: Error) => void;
}

export interface Watcher {
  /**
   * Stop watching and clean up
   */
  stop: () => Promise<void>;

  /**
   * Get the underlying chokidar watcher
   */
  getWatcher: () => FSWatcher;
}

/**
 * Watch files for changes and re-extract on modifications
 *
 * @example
 * const watcher = watch({
 *   root: './src',
 *   onChange: (result) => {
 *     console.log('Components updated:', result.metadata);
 *   }
 * });
 *
 * // Later...
 * await watcher.stop();
 */
export function watch(options: WatchOptions): Watcher {
  const { onChange, onAdd, onDelete, onError, ...extractConfig } = options;

  // Build config with defaults
  const config: ExtractConfig = {
    root: extractConfig.root || process.cwd(),
    include: extractConfig.include || [],
    exclude: extractConfig.exclude || [],
    errorHandling: extractConfig.errorHandling || 'collect',
    cache: extractConfig.cache ?? false,
  };

  // Run initial extraction
  extract(config)
    .then(onChange)
    .catch((error) => {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    });

  // Create watcher
  const watcher = chokidar.watch(config.include, {
    cwd: config.root,
    ignored: config.exclude,
    ignoreInitial: true,
    persistent: true,
  });

  // Handle file changes
  watcher.on("change", async (filePath) => {
    try {
      const result = await extract({
        ...config,
        include: [filePath],
      });
      onChange(result);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  });

  // Handle file additions
  watcher.on("add", async (filePath) => {
    onAdd?.(filePath);
    try {
      const result = await extract({
        ...config,
        include: [filePath],
      });
      onChange(result);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  });

  // Handle file deletions
  watcher.on("unlink", (filePath) => {
    onDelete?.(filePath);
  });

  // Handle errors
  watcher.on("error", (error) => {
    onError?.(error instanceof Error ? error : new Error(String(error)));
  });

  return {
    stop: async () => {
      await watcher.close();
    },
    getWatcher: () => watcher,
  };
}
