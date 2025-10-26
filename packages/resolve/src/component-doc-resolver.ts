import { extract } from "@tapestrylab/extract";
import type { Resolver } from "./resolver.js";
import type { ComponentLoader } from "./component-loader.js";
import type { SSRRenderer } from "./ssr-renderer.js";
import type { SandboxConfigGenerator } from "./sandbox-config-generator.js";
import { createComponentLoader } from "./component-loader.js";
import { createSSRRenderer } from "./ssr-renderer.js";
import { createSandboxConfigGenerator } from "./sandbox-config-generator.js";
import { toComponentDoc } from "./extract-integration.js";
import type { ComponentDoc, ComponentDocResolveOptions } from "./component-types.js";

/**
 * ComponentDocResolver interface
 */
export interface ComponentDocResolver {
  resolve(options: ComponentDocResolveOptions): Promise<ComponentDoc>;
  resolveMany(
    entries: string[],
    options?: Omit<ComponentDocResolveOptions, "entry">
  ): Promise<ComponentDoc[]>;
}

/**
 * ComponentDocResolver configuration
 */
export interface ComponentDocResolverConfig {
  renderFunction?: (component: any, props?: any) => string;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Create error HTML when preview rendering fails
 */
function createPreviewErrorHtml(error: any): string {
  const message = error instanceof Error ? error.message : String(error);
  return `<div class="tapestry-preview tapestry-preview--error">
    <p>Preview rendering failed: ${escapeHtml(message)}</p>
  </div>`;
}

/**
 * Create a component documentation resolver that orchestrates component loading,
 * metadata extraction, SSR preview generation, and sandbox configuration
 */
export function createComponentDocResolver(
  module_resolver: Resolver,
  config: ComponentDocResolverConfig = {}
): ComponentDocResolver {
  const component_loader = createComponentLoader(module_resolver);
  const ssr_renderer = createSSRRenderer({ renderFunction: config.renderFunction });
  const sandbox_generator = createSandboxConfigGenerator();

  /**
   * Resolve component documentation with optional SSR preview and sandbox config
   */
  async function resolve(options: ComponentDocResolveOptions): Promise<ComponentDoc> {
    // Step 1: Load component and resolve imports
    const loaded = await component_loader.load(options.entry);

    // Step 2: Extract metadata using @tapestrylab/extract
    const extractResult = await extract({
      root: process.cwd(),
      include: [options.entry],
      exclude: [],
      output: "", // Not writing to file, just extracting
    });

    if (extractResult.errors.length > 0) {
      console.warn("Extract errors:", extractResult.errors);
    }

    if (extractResult.metadata.length === 0) {
      throw new Error(`No component metadata found in ${options.entry}`);
    }

    // Use the first component found
    const metadata = extractResult.metadata[0];

    // Step 3: Convert to ComponentDoc
    let componentDoc = toComponentDoc(metadata);

    // Step 4: Add resolved imports
    componentDoc.imports = loaded.imports.map((imp) => imp.specifier);

    // Step 5: Generate SSR preview if requested
    if (options.renderPreview) {
      try {
        // Try to dynamically import the component
        const componentModule = await import(loaded.filePath);
        const component = componentModule.default || componentModule[metadata.name];

        if (component) {
          const previewHtml = await ssr_renderer.render(
            component,
            options.previewProps
          );
          componentDoc.previewHtml = previewHtml;
        }
      } catch (error) {
        console.warn("Failed to render SSR preview:", error);
        componentDoc.previewHtml = createPreviewErrorHtml(error);
      }
    }

    // Step 6: Generate sandbox config if requested
    if (options.sandbox) {
      componentDoc.sandbox = sandbox_generator.generate(loaded, {
        template: "react-ts",
      });
    }

    return componentDoc;
  }

  /**
   * Resolve multiple components in parallel
   */
  async function resolveMany(
    entries: string[],
    options: Omit<ComponentDocResolveOptions, "entry"> = {}
  ): Promise<ComponentDoc[]> {
    return Promise.all(
      entries.map((entry) => resolve({ ...options, entry }))
    );
  }

  return {
    resolve,
    resolveMany,
  };
}
