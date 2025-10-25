/**
 * @tapestrylab/resolve
 *
 * Unified system for resolving component, docs, and dependency references
 * across the Tapestry ecosystem.
 *
 * Supports:
 * - Module resolution (local files, CDN, remote registries)
 * - Component documentation extraction
 * - Server-side rendering of component previews
 * - Interactive sandbox configuration generation
 */

// Core module resolution exports
export { Resolver } from "./Resolver.js";
export type {
  ResolverConfig,
  ResolverStrategy,
  ResolvedEntry,
  ResolvedSource,
  ResolutionContext,
} from "./types.js";

// Component documentation exports
export { ComponentDocResolver } from "./ComponentDocResolver.js";
export { ComponentLoader } from "./ComponentLoader.js";
export { SSRRenderer } from "./SSRRenderer.js";
export { SandboxConfigGenerator } from "./SandboxConfigGenerator.js";
export { ExtractIntegration } from "./ExtractIntegration.js";

export type {
  ComponentDoc,
  PropDoc,
  ExampleDoc,
  SandboxConfig,
  ResolveOptions,
} from "./component-types.js";
export type { LoadedComponent } from "./ComponentLoader.js";

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
import { ComponentDocResolver } from "./ComponentDocResolver.js";
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
 * Create a module resolver with the given configuration
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

/**
 * Create a component documentation resolver
 * @param config - Module resolver configuration
 * @param options - Component resolver options
 * @returns Configured ComponentDocResolver instance
 *
 * @example
 * ```ts
 * const docResolver = createComponentResolver({
 *   strategies: [
 *     strategies.local({ root: '/src', alias: { '@ui': 'components' } })
 *   ]
 * });
 *
 * const docs = await docResolver.resolve({
 *   entry: '/src/components/Button.tsx',
 *   renderPreview: true,
 *   sandbox: true
 * });
 *
 * console.log(docs.name); // "Button"
 * console.log(docs.props); // [{ name: "children", type: "ReactNode", ... }]
 * console.log(docs.previewHtml); // "<div class=\"tapestry-preview\">...</div>"
 * ```
 */
export function createComponentResolver(
  config: ResolverConfig = {},
  options: { renderFunction?: (component: any, props?: any) => string } = {}
): ComponentDocResolver {
  const moduleResolver = createResolver(config);
  return new ComponentDocResolver(moduleResolver, options);
}
