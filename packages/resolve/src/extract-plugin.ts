/**
 * Extract plugin for automatic relationship resolution
 */

import type { ExtractorPlugin, ExtractedMetadata } from "@tapestrylab/extract";
import { findUsageSites, findDependencies, findDependents } from "./relationship-resolver.js";

export interface ResolvePluginConfig {
  /**
   * Project root for relationship resolution
   */
  projectRoot: string;

  /**
   * Enable usage site detection
   */
  includeUsageSites?: boolean;

  /**
   * Enable dependency detection
   */
  includeDependencies?: boolean;

  /**
   * Enable dependent detection
   */
  includeDependents?: boolean;
}

/**
 * Create an extract plugin that enriches components with relationship data
 *
 * @example
 * import { extract } from '@tapestrylab/extract';
 * import { createResolvePlugin } from '@tapestrylab/resolve';
 *
 * const plugin = createResolvePlugin({ projectRoot: './src' });
 *
 * const result = await extract(
 *   { root: './src' },
 *   [plugin]
 * );
 */
export function createResolvePlugin(
  config: ResolvePluginConfig
): ExtractorPlugin {
  return {
    name: "tapestry-resolve",

    async afterExtract(metadata: ExtractedMetadata) {
      if (metadata.type !== "component") {
        return metadata;
      }

      const enriched = { ...metadata };

      // Add relationship data based on config
      const promises: Promise<any>[] = [];

      if (config.includeUsageSites !== false) {
        promises.push(
          findUsageSites(metadata.filePath, config.projectRoot).then(
            (usageSites) => {
              (enriched as any).usageSites = usageSites;
            }
          )
        );
      }

      if (config.includeDependencies !== false) {
        promises.push(
          findDependencies(metadata.filePath, config.projectRoot).then(
            (dependencies) => {
              (enriched as any).dependencies = dependencies;
            }
          )
        );
      }

      if (config.includeDependents !== false) {
        promises.push(
          findDependents(metadata.filePath, config.projectRoot).then(
            (dependents) => {
              (enriched as any).dependents = dependents;
            }
          )
        );
      }

      await Promise.all(promises);

      return enriched;
    },
  };
}
