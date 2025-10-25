/**
 * Wrapper around @tapestrylab/resolve for component relationship resolution
 */

import type { ComponentMetadata } from '@tapestrylab/extract';
import type { EnrichedComponentData } from './types';

/**
 * Resolve component relationships
 *
 * Note: @tapestrylab/resolve is still in early development, so this is a stub
 * implementation that returns empty relationship data.
 *
 * Once resolve is fully implemented, this will:
 * - Find usage sites (where component is imported/used)
 * - Find dependencies (what the component imports)
 * - Find dependents (what imports this component)
 */
export async function resolveRelationships(
  component: ComponentMetadata,
  _projectRoot: string
): Promise<EnrichedComponentData> {
  // TODO: Implement when @tapestrylab/resolve is ready
  // const resolver = createResolver({ ... });
  // const usageSites = await resolver.findUsageSites(component.filePath);
  // const dependencies = await resolver.findDependencies(component.filePath);
  // const dependents = await resolver.findDependents(component.filePath);

  // For now, return enriched data with empty arrays
  return {
    ...component,
    usageSites: [],
    dependencies: [],
    dependents: [],
  };
}

/**
 * Resolve relationships for multiple components
 */
export async function resolveRelationshipsForAll(
  components: ComponentMetadata[],
  projectRoot: string
): Promise<EnrichedComponentData[]> {
  return Promise.all(
    components.map((component) => resolveRelationships(component, projectRoot))
  );
}
