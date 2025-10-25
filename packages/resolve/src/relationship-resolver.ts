/**
 * Relationship resolution for components
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { ComponentMetadata } from "@tapestrylab/extract";
import type { EnrichedComponentData, UsageSite, Dependency, Dependent } from "./types.js";

/**
 * Find where a component is being used
 */
export async function findUsageSites(
  componentPath: string,
  projectRoot: string
): Promise<UsageSite[]> {
  // TODO: Implement actual usage site detection
  // This would involve:
  // 1. Finding the component's export name
  // 2. Scanning project files for import statements
  // 3. Tracking import aliases
  // 4. Finding JSX usage of the component

  return [];
}

/**
 * Find dependencies that a component imports
 */
export async function findDependencies(
  componentPath: string,
  projectRoot: string
): Promise<Dependency[]> {
  const dependencies: Dependency[] = [];

  try {
    const content = await fs.readFile(componentPath, "utf-8");

    // Match import statements
    const importRegex = /import\s+(?:{[^}]+}|[\w]+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];

      if (importPath.startsWith(".") || importPath.startsWith("/")) {
        // Local import
        dependencies.push({
          name: path.basename(importPath, path.extname(importPath)),
          type: "local",
          path: importPath,
        });
      } else if (!importPath.startsWith("node:")) {
        // NPM package (excluding node: built-ins)
        // Extract package name (handle scoped packages)
        const pkgMatch = importPath.match(/^(@[^/]+\/[^/]+|[^/]+)/);
        if (pkgMatch) {
          dependencies.push({
            name: pkgMatch[1],
            type: "npm",
          });
        }
      }
    }
  } catch (error) {
    // Silently fail - file might not exist or be readable
  }

  return dependencies;
}

/**
 * Find components that depend on this component
 */
export async function findDependents(
  componentPath: string,
  projectRoot: string
): Promise<Dependent[]> {
  // TODO: Implement actual dependent detection
  // This would involve:
  // 1. Getting the component's name from its exports
  // 2. Scanning all project files for imports of this component
  // 3. Building a reverse dependency graph

  return [];
}

/**
 * Resolve all relationships for a component
 */
export async function resolveRelationships(
  component: ComponentMetadata,
  projectRoot: string
): Promise<EnrichedComponentData> {
  const [usageSites, dependencies, dependents] = await Promise.all([
    findUsageSites(component.filePath, projectRoot),
    findDependencies(component.filePath, projectRoot),
    findDependents(component.filePath, projectRoot),
  ]);

  return {
    ...component,
    usageSites,
    dependencies,
    dependents,
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
