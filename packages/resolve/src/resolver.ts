import type {
  ResolverConfig,
  ResolverStrategy,
  ResolvedEntry,
  ResolutionContext,
} from "./types.js";

/**
 * Resolver interface returned by createResolver
 */
export interface Resolver {
  resolve(id: string, context?: ResolutionContext): Promise<ResolvedEntry | null>;
  resolveMany(ids: string[], context?: ResolutionContext): Promise<Map<string, ResolvedEntry | null>>;
  clearCache(): void;
  getCacheSize(): number;
  addStrategy(strategy: ResolverStrategy, prepend?: boolean): void;
  getStrategies(): ResolverStrategy[];
}

/**
 * Core resolver factory that orchestrates multiple resolution strategies
 */
export function createResolver(config: ResolverConfig = {}): Resolver {
  const strategies: ResolverStrategy[] = config.strategies ?? [];
  const cacheEnabled = config.cache ?? true;
  const cacheMap = new Map<string, ResolvedEntry | null>();
  const defaultContext = config.context ?? {};

  /**
   * Resolve a module identifier using the configured strategies
   * @param id - The module identifier to resolve
   * @param context - Optional resolution context to override default
   * @returns Resolved entry or null if unable to resolve
   */
  async function resolve(
    id: string,
    context?: ResolutionContext
  ): Promise<ResolvedEntry | null> {
    // Merge contexts
    const mergedContext = { ...defaultContext, ...context };

    // Check cache
    if (cacheEnabled && cacheMap.has(id)) {
      return cacheMap.get(id) ?? null;
    }

    // Try each strategy in order
    for (const strategy of strategies) {
      try {
        const result = await strategy.resolve(id, mergedContext);
        if (result) {
          // Cache successful resolution
          if (cacheEnabled) {
            cacheMap.set(id, result);
          }
          return result;
        }
      } catch (error) {
        // Log error but continue to next strategy
        console.warn(
          `Strategy "${strategy.name}" failed to resolve "${id}":`,
          error
        );
      }
    }

    // Cache failed resolution
    if (cacheEnabled) {
      cacheMap.set(id, null);
    }

    return null;
  }

  /**
   * Resolve multiple identifiers in parallel
   * @param ids - Array of identifiers to resolve
   * @param context - Optional resolution context
   * @returns Map of identifier to resolved entry
   */
  async function resolveMany(
    ids: string[],
    context?: ResolutionContext
  ): Promise<Map<string, ResolvedEntry | null>> {
    const results = await Promise.all(
      ids.map(async (id) => {
        const resolved = await resolve(id, context);
        return [id, resolved] as const;
      })
    );
    return new Map(results);
  }

  /**
   * Clear the resolution cache
   */
  function clearCache(): void {
    cacheMap.clear();
  }

  /**
   * Get the number of cached entries
   */
  function getCacheSize(): number {
    return cacheMap.size;
  }

  /**
   * Add a new strategy to the resolver
   * @param strategy - The strategy to add
   * @param prepend - If true, add to the beginning of the strategy list
   */
  function addStrategy(strategy: ResolverStrategy, prepend = false): void {
    if (prepend) {
      strategies.unshift(strategy);
    } else {
      strategies.push(strategy);
    }
  }

  /**
   * Get all registered strategies
   */
  function getStrategies(): ResolverStrategy[] {
    return [...strategies];
  }

  return {
    resolve,
    resolveMany,
    clearCache,
    getCacheSize,
    addStrategy,
    getStrategies,
  };
}
