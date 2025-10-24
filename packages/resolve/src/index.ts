/**
 * @tapestrylab/resolve
 *
 * Unified system for resolving component, docs, and dependency references
 * across the Tapestry ecosystem.
 */

// Core exports
export { Resolver } from "./Resolver.js";
export type {
  ResolverConfig,
  ResolverStrategy,
  ResolvedEntry,
  ResolvedSource,
  ResolutionContext,
} from "./types.js";

// Strategy exports
export { local } from "./strategies/local.js";
export type { LocalStrategyConfig } from "./strategies/local.js";

export { cdn } from "./strategies/cdn.js";
export type { CDNStrategyConfig, CDNProvider } from "./strategies/cdn.js";

export { remote } from "./strategies/remote.js";
export type { RemoteStrategyConfig } from "./strategies/remote.js";

// Utility exports
export {
  normalizePath,
  isRelativePath,
  isAbsolutePath,
  isUrl,
  isBareModuleSpecifier,
} from "./utils/normalizePath.js";

// Convenience exports
import { local } from "./strategies/local.js";
import { cdn } from "./strategies/cdn.js";
import { remote } from "./strategies/remote.js";
import { Resolver } from "./Resolver.js";
import type { ResolverConfig } from "./types.js";

/**
 * Built-in resolution strategies
 */
export const strategies = {
  local,
  cdn,
  remote,
};

/**
 * Create a resolver with the given configuration
 * @param config - Resolver configuration
 * @returns Configured Resolver instance
 *
 * @example
 * ```ts
 * const resolver = createResolver({
 *   strategies: [
 *     strategies.local({ root: '/src', alias: { '@ui': 'components' } }),
 *     strategies.cdn({ provider: 'esm.sh' })
 *   ]
 * });
 *
 * const result = await resolver.resolve('@radix-ui/react-popover');
 * console.log(result?.path); // https://esm.sh/@radix-ui/react-popover
 * ```
 */
export function createResolver(config: ResolverConfig = {}): Resolver {
  return new Resolver(config);
}
