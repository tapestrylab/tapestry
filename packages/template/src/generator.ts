/**
 * Main generator - orchestrates the full template rendering pipeline
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { ExtractConfig } from '@tapestrylab/extract';
import type { Template, RenderContext, RenderResult, TemplateDataContext } from './types';
import type { TapestryTheme, ResolvedTheme } from './types-theme';
import { extractComponents } from './extract-wrapper';
import { resolveRelationshipsForAll } from './resolve-wrapper';
import { matchTemplate, type TemplateMatchRule } from './matcher';
import { loadTheme, resolveTheme } from './theme-resolver';
import { renderMarkdown } from './renderer-markdown';
import { renderMDX } from './renderer-mdx';

/**
 * Generation configuration
 */
export interface GenerateConfig {
  // Data source
  data?: TemplateDataContext; // Pre-extracted component data
  source?: string; // Source file/directory for extraction
  extractConfig?: ExtractConfig; // Extract configuration

  // Template
  template?: Template | string; // Template object or path to template file
  templateRules?: TemplateMatchRule[]; // Template matching rules

  // Theme
  theme?: TapestryTheme | string; // Theme object or path to theme file

  // Output
  output?: string; // Output file path
  outputFormat?: 'markdown' | 'mdx' | 'html';

  // Options
  includeRelationships?: boolean; // Whether to resolve relationships
  projectRoot?: string; // Project root for relationship resolution
}

/**
 * Batch generation configuration
 */
export interface GenerateAllConfig extends Omit<GenerateConfig, 'data' | 'output'> {
  source: string; // Required for batch generation
  outputDir: string; // Output directory
  outputFormat?: 'markdown' | 'mdx' | 'html';
}

/**
 * Generate documentation for a single component
 */
export async function generate(config: GenerateConfig): Promise<RenderResult> {
  // Step 1: Get component data
  let componentData: TemplateDataContext;

  if (config.data) {
    componentData = config.data;
  } else if (config.source) {
    // Extract from source (defaults handle include/exclude automatically)
    const components = await extractComponents(
      config.extractConfig || {
        root: config.source,
      }
    );

    if (components.length === 0) {
      throw new Error(`No components found in ${config.source}`);
    }

    componentData = components[0] as TemplateDataContext;

    // Optionally resolve relationships
    if (config.includeRelationships && config.projectRoot) {
      const enriched = await resolveRelationshipsForAll(
        [componentData],
        config.projectRoot
      );
      componentData = enriched[0];
    }
  } else {
    throw new Error('Either data or source must be provided');
  }

  // Step 2: Load template
  let template: Template;

  if (config.template) {
    if (typeof config.template === 'string') {
      // Load from file
      const content = await fs.readFile(config.template, 'utf-8');
      template = JSON.parse(content);
    } else {
      template = config.template;
    }
  } else if (config.templateRules) {
    // Match template based on rules
    const matched = matchTemplate(componentData, config.templateRules);
    if (!matched) {
      throw new Error('No template matched for component');
    }
    template = matched;
  } else {
    throw new Error('Either template or templateRules must be provided');
  }

  // Step 3: Load and resolve theme
  let resolvedTheme: ResolvedTheme | undefined;

  if (config.theme) {
    const themeObj =
      typeof config.theme === 'string'
        ? await loadTheme(config.theme)
        : config.theme;
    resolvedTheme = resolveTheme(themeObj);
  }

  // Step 4: Render
  const outputFormat = config.outputFormat || template.outputFormat || 'markdown';

  const renderContext: RenderContext = {
    data: componentData,
    theme: resolvedTheme,
    outputFormat,
  };

  const result =
    outputFormat === 'mdx'
      ? renderMDX(template, renderContext)
      : renderMarkdown(template, renderContext);

  // Step 5: Write to file (if output specified)
  if (config.output) {
    await writeOutput(config.output, result.content);
  }

  return result;
}

/**
 * Generate documentation for all components in a directory
 */
export async function generateAll(
  config: GenerateAllConfig
): Promise<Map<string, RenderResult>> {
  // Step 1: Extract all components (defaults handle patterns automatically)
  const components = await extractComponents(
    config.extractConfig || {
      root: config.source,
    }
  );

  if (components.length === 0) {
    throw new Error(`No components found in ${config.source}`);
  }

  console.log(`Found ${components.length} component(s)`);

  // Step 2: Optionally resolve relationships
  let enrichedComponents: TemplateDataContext[] = components as TemplateDataContext[];

  if (config.includeRelationships) {
    console.log('Resolving relationships...');
    enrichedComponents = await resolveRelationshipsForAll(
      components,
      config.projectRoot || config.source
    );
  }

  // Step 3: Load template(s) and theme
  const outputFormat = config.outputFormat || 'markdown';
  const theme = config.theme
    ? typeof config.theme === 'string'
      ? await loadTheme(config.theme)
      : config.theme
    : undefined;
  const resolvedTheme = theme ? resolveTheme(theme) : undefined;

  // Step 4: Generate documentation for each component
  const results = new Map<string, RenderResult>();

  for (const component of enrichedComponents) {
    console.log(`Generating docs for ${component.name}...`);

    // Match template for this component
    let template: Template;

    if (config.template) {
      template =
        typeof config.template === 'string'
          ? JSON.parse(await fs.readFile(config.template, 'utf-8'))
          : config.template;
    } else if (config.templateRules) {
      const matched = matchTemplate(component, config.templateRules);
      if (!matched) {
        console.warn(`No template matched for ${component.name}, skipping`);
        continue;
      }
      template = matched;
    } else {
      throw new Error('Either template or templateRules must be provided');
    }

    // Render
    const renderContext: RenderContext = {
      data: component,
      theme: resolvedTheme,
      outputFormat,
    };

    const result =
      outputFormat === 'mdx'
        ? renderMDX(template, renderContext)
        : renderMarkdown(template, renderContext);

    // Write to file
    const ext = outputFormat === 'mdx' ? '.mdx' : '.md';
    const outputPath = path.join(config.outputDir, `${component.name}${ext}`);
    await writeOutput(outputPath, result.content);

    results.set(component.name, result);
  }

  console.log(`Generated ${results.size} documentation file(s) in ${config.outputDir}`);

  return results;
}

/**
 * Combined extract + resolve helper
 */
export async function extractAndResolve(
  extractConfig: ExtractConfig,
  projectRoot?: string
): Promise<TemplateDataContext[]> {
  const components = await extractComponents(extractConfig);
  return resolveRelationshipsForAll(
    components,
    projectRoot || extractConfig.root || process.cwd()
  );
}

/**
 * Write output to file
 */
async function writeOutput(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}
