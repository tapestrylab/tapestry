import type {
  ResolverConfig,
  ResolverStrategy,
  ResolvedEntry,
  ResolutionContext,
} from "./types.js";

/**
 * Core Resolver class that orchestrates multiple resolution strategies
 */
export class Resolver {
  private strategies: ResolverStrategy[];
  private cache: Map<string, ResolvedEntry | null>;
  private cacheEnabled: boolean;
  private context: ResolutionContext;

  constructor(config: ResolverConfig = {}) {
    this.strategies = config.strategies ?? [];
    this.cacheEnabled = config.cache ?? true;
    this.cache = new Map();
    this.context = config.context ?? {};
  }

  /**
   * Resolve a module identifier using the configured strategies
   * @param id - The module identifier to resolve
   * @param context - Optional resolution context to override default
   * @returns Resolved entry or null if unable to resolve
   */
  async resolve(
    id: string,
    context?: ResolutionContext
  ): Promise<ResolvedEntry | null> {
    // Merge contexts
    const mergedContext = { ...this.context, ...context };

    // Check cache
    if (this.cacheEnabled && this.cache.has(id)) {
      return this.cache.get(id) ?? null;
    }

    // Try each strategy in order
    for (const strategy of this.strategies) {
      try {
        const result = await strategy.resolve(id, mergedContext);
        if (result) {
          // Cache successful resolution
          if (this.cacheEnabled) {
            this.cache.set(id, result);
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
    if (this.cacheEnabled) {
      this.cache.set(id, null);
    }

    return null;
  }

  /**
   * Resolve multiple identifiers in parallel
   * @param ids - Array of identifiers to resolve
   * @param context - Optional resolution context
   * @returns Map of identifier to resolved entry
   */
  async resolveMany(
    ids: string[],
    context?: ResolutionContext
  ): Promise<Map<string, ResolvedEntry | null>> {
    const results = await Promise.all(
      ids.map(async (id) => {
        const resolved = await this.resolve(id, context);
        return [id, resolved] as const;
      })
    );
    return new Map(results);
  }

  /**
   * Clear the resolution cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get the number of cached entries
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Add a new strategy to the resolver
   * @param strategy - The strategy to add
   * @param prepend - If true, add to the beginning of the strategy list
   */
  addStrategy(strategy: ResolverStrategy, prepend = false): void {
    if (prepend) {
      this.strategies.unshift(strategy);
    } else {
      this.strategies.push(strategy);
    }
  }

  /**
   * Get all registered strategies
   */
  getStrategies(): ResolverStrategy[] {
    return [...this.strategies];
  }
}
