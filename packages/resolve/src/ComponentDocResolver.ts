import { extract } from "@tapestrylab/extract";
import { Resolver } from "./Resolver.js";
import { ComponentLoader } from "./ComponentLoader.js";
import { ExtractIntegration } from "./ExtractIntegration.js";
import { SSRRenderer } from "./SSRRenderer.js";
import { SandboxConfigGenerator } from "./SandboxConfigGenerator.js";
import type { ComponentDoc, ResolveOptions } from "./component-types.js";

/**
 * ComponentDocResolver orchestrates component loading, metadata extraction,
 * SSR preview generation, and sandbox configuration
 */
export class ComponentDocResolver {
  private moduleResolver: Resolver;
  private componentLoader: ComponentLoader;
  private ssrRenderer: SSRRenderer;
  private sandboxGenerator: SandboxConfigGenerator;

  constructor(moduleResolver: Resolver, options: { renderFunction?: (component: any, props?: any) => string } = {}) {
    this.moduleResolver = moduleResolver;
    this.componentLoader = new ComponentLoader(moduleResolver);
    this.ssrRenderer = new SSRRenderer({ renderFunction: options.renderFunction });
    this.sandboxGenerator = new SandboxConfigGenerator();
  }

  /**
   * Resolve component documentation with optional SSR preview and sandbox config
   */
  async resolve(options: ResolveOptions): Promise<ComponentDoc> {
    // Step 1: Load component and resolve imports
    const loaded = await this.componentLoader.load(options.entry);

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
    let componentDoc = ExtractIntegration.toComponentDoc(metadata);

    // Step 4: Add resolved imports
    componentDoc.imports = loaded.imports.map((imp) => imp.specifier);

    // Step 5: Generate SSR preview if requested
    if (options.renderPreview) {
      try {
        // Try to dynamically import the component
        const componentModule = await import(loaded.filePath);
        const component = componentModule.default || componentModule[metadata.name];

        if (component) {
          const previewHtml = await this.ssrRenderer.render(
            component,
            options.previewProps
          );
          componentDoc.previewHtml = previewHtml;
        }
      } catch (error) {
        console.warn("Failed to render SSR preview:", error);
        componentDoc.previewHtml = this.createPreviewErrorHtml(error);
      }
    }

    // Step 6: Generate sandbox config if requested
    if (options.sandbox) {
      componentDoc.sandbox = this.sandboxGenerator.generate(loaded, {
        template: "react-ts",
      });
    }

    return componentDoc;
  }

  /**
   * Resolve multiple components in parallel
   */
  async resolveMany(
    entries: string[],
    options: Omit<ResolveOptions, "entry"> = {}
  ): Promise<ComponentDoc[]> {
    return Promise.all(
      entries.map((entry) => this.resolve({ ...options, entry }))
    );
  }

  /**
   * Create error HTML when preview rendering fails
   */
  private createPreviewErrorHtml(error: any): string {
    const message = error instanceof Error ? error.message : String(error);
    return `<div class="tapestry-preview tapestry-preview--error">
      <p>Preview rendering failed: ${this.escapeHtml(message)}</p>
    </div>`;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
  }
}
