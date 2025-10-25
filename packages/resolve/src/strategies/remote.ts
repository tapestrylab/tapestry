import type { ResolverStrategy } from "../types.js";

export interface RemoteStrategyConfig {
  /** Base URL for the remote registry */
  registryUrl?: string;
  /** API key for authenticated requests */
  apiKey?: string;
}

/**
 * Remote registry resolution strategy (stub for future implementation)
 * Could be used to fetch from Tapestry Cloud, Figma API, or other remote sources
 */
export function remote(config: RemoteStrategyConfig = {}): ResolverStrategy {
  return {
    name: "remote",
    async resolve(id: string) {
      // Placeholder for future implementation
      // Could fetch from:
      // - Tapestry Cloud registry
      // - Figma API for design tokens
      // - Private component registries
      // - etc.
      return null;
    },
  };
}
