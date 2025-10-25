import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { Resolver } from "./Resolver.js";

/**
 * Component loading result
 */
export interface LoadedComponent {
  /** Original file path */
  filePath: string;
  /** Component source code */
  source: string;
  /** Resolved imports */
  imports: Array<{ specifier: string; resolvedPath: string | null }>;
}

/**
 * ComponentLoader handles loading component files and resolving their imports
 */
export class ComponentLoader {
  constructor(private resolver: Resolver) {}

  /**
   * Load a component file and resolve all its imports
   */
  async load(filePath: string): Promise<LoadedComponent> {
    // Read the component source
    const absolutePath = resolve(filePath);
    const source = readFileSync(absolutePath, "utf-8");

    // Extract import statements (simple regex-based extraction)
    const imports = this.extractImports(source);

    // Resolve each import
    const resolvedImports = await Promise.all(
      imports.map(async (specifier) => {
        const resolved = await this.resolver.resolve(specifier, {
          importer: absolutePath,
        });
        return {
          specifier,
          resolvedPath: resolved?.path ?? null,
        };
      })
    );

    return {
      filePath: absolutePath,
      source,
      imports: resolvedImports,
    };
  }

  /**
   * Extract import specifiers from source code
   * This is a simple implementation - for production use @tapestrylab/extract
   */
  private extractImports(source: string): string[] {
    const imports: string[] = [];

    // Match ES module imports: import ... from 'specifier'
    const importRegex = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;

    while ((match = importRegex.exec(source)) !== null) {
      imports.push(match[1]);
    }

    // Match dynamic imports: import('specifier')
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = dynamicImportRegex.exec(source)) !== null) {
      imports.push(match[1]);
    }

    // Match require statements: require('specifier')
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(source)) !== null) {
      imports.push(match[1]);
    }

    return [...new Set(imports)]; // Deduplicate
  }

  /**
   * Load multiple components in parallel
   */
  async loadMany(filePaths: string[]): Promise<LoadedComponent[]> {
    return Promise.all(filePaths.map((path) => this.load(path)));
  }
}
