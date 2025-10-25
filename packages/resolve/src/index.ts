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
export { createResolver } from "./resolver.js";
export type { Resolver } from "./resolver.js";
export type {
  ResolverConfig,
  ResolverStrategy,
  ResolvedEntry,
  ResolvedSource,
  ResolutionContext,
  // Component enrichment types
  EnrichedComponentData,
  UsageSite,
  Dependency,
  Dependent,
} from "./types.js";

// Component extraction and resolution exports
export { extractComponent, extractComponents } from "./component-extractor.js";
export {
  resolveComponent,
  resolveComponents,
  type ResolveOptions,
} from "./component-resolve-api.js";
export {
  resolveRelationships,
  resolveRelationshipsForAll,
  findUsageSites,
  findDependencies,
  findDependents,
} from "./relationship-resolver.js";
export {
  createResolvePlugin,
  type ResolvePluginConfig,
} from "./extract-plugin.js";

// Component documentation exports
export { createComponentDocResolver } from "./component-doc-resolver.js";
export type {
  ComponentDocResolver,
  ComponentDocResolverConfig,
} from "./component-doc-resolver.js";

export { createComponentLoader } from "./component-loader.js";
export type { ComponentLoader, LoadedComponent } from "./component-loader.js";

export { createSSRRenderer } from "./ssr-renderer.js";
export type { SSRRenderer, SSRRendererConfig } from "./ssr-renderer.js";

export { createSandboxConfigGenerator } from "./sandbox-config-generator.js";
export type { SandboxConfigGenerator } from "./sandbox-config-generator.js";

export { toComponentDoc, toComponentDocs } from "./extract-integration.js";

export type {
  ComponentDoc,
  PropDoc,
  ExampleDoc,
  SandboxConfig,
  ComponentDocResolveOptions,
} from "./component-types.js";

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
} from "./utils/normalize-path.js";

// Convenience exports
import { local } from "./strategies/local.js";
import { cdn } from "./strategies/cdn.js";
import { remote } from "./strategies/remote.js";

/**
 * Built-in resolution strategies
 */
export const strategies = {
  local,
  cdn,
  remote,
};
