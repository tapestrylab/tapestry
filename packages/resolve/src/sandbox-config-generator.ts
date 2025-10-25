import type { SandboxConfig } from "./component-types.js";
import type { LoadedComponent } from "./component-loader.js";

/**
 * SandboxConfigGenerator interface
 */
export interface SandboxConfigGenerator {
  generate(
    component: LoadedComponent,
    options?: {
      template?: string;
      additionalDependencies?: Record<string, string>;
      exampleCode?: string;
    }
  ): SandboxConfig;
  generateMany(
    components: LoadedComponent[],
    options?: {
      template?: string;
      additionalDependencies?: Record<string, string>;
    }
  ): SandboxConfig[];
}

/**
 * Extract npm package name from import specifier
 */
function extractPackageName(specifier: string): string {
  // Handle scoped packages (@org/package)
  if (specifier.startsWith("@")) {
    const parts = specifier.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : specifier;
  }

  // Handle regular packages (package or package/subpath)
  const firstSlash = specifier.indexOf("/");
  return firstSlash === -1 ? specifier : specifier.slice(0, firstSlash);
}

/**
 * Extract npm dependencies from component imports
 */
function extractDependencies(
  component: LoadedComponent,
  additional?: Record<string, string>
): Record<string, string> {
  const dependencies: Record<string, string> = { ...additional };

  for (const imp of component.imports) {
    const { specifier } = imp;

    // Skip relative imports
    if (specifier.startsWith(".") || specifier.startsWith("/")) {
      continue;
    }

    // Extract package name (handle scoped packages)
    const packageName = extractPackageName(specifier);

    // Add to dependencies if not already present
    if (!dependencies[packageName]) {
      dependencies[packageName] = "latest"; // Default to latest
    }
  }

  return dependencies;
}

/**
 * Get file name from path
 */
function getFileName(filePath: string): string {
  return filePath.split("/").pop() || "Component.tsx";
}

/**
 * Extract component name from source code
 */
function extractComponentName(source: string): string {
  // Try to find export default function/const ComponentName
  const defaultExport =
    /export\s+default\s+(?:function|const)\s+(\w+)/.exec(source);
  if (defaultExport) return defaultExport[1];

  // Try to find export function ComponentName
  const namedExport = /export\s+(?:function|const)\s+(\w+)/.exec(source);
  if (namedExport) return namedExport[1];

  return "Component";
}

/**
 * Generate default example code
 */
function generateDefaultExample(component: LoadedComponent): string {
  const componentName = extractComponentName(component.source);
  const fileName = getFileName(component.filePath);

  return `import React from 'react';
import { ${componentName} } from './${fileName.replace(/\.(tsx?|jsx?)$/, "")}';

export default function App() {
  return (
    <div>
      <${componentName} />
    </div>
  );
}
`;
}

/**
 * Generate index.html for sandbox
 */
function generateIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
}

/**
 * Infer sandbox template from component
 */
function inferTemplate(component: LoadedComponent): string {
  const source = component.source;

  // Check for framework-specific imports
  if (source.includes("from 'react'") || source.includes('from "react"')) {
    return "react-ts";
  }

  if (source.includes("from 'vue'") || source.includes('from "vue"')) {
    return "vue-ts";
  }

  if (
    source.includes("from 'svelte'") ||
    source.includes('from "svelte"')
  ) {
    return "svelte";
  }

  // Default to React
  return "react-ts";
}

/**
 * Create files map for sandbox
 */
function createFiles(
  component: LoadedComponent,
  exampleCode?: string
): Record<string, string> {
  const files: Record<string, string> = {};

  // Add main component file
  const fileName = getFileName(component.filePath);
  files[fileName] = component.source;

  // Add example file if provided
  if (exampleCode) {
    files["App.tsx"] = exampleCode;
  } else {
    // Generate default example
    files["App.tsx"] = generateDefaultExample(component);
  }

  // Add index.html
  files["index.html"] = generateIndexHtml();

  return files;
}

/**
 * Create a sandbox config generator that creates interactive sandbox configurations
 * for component examples
 */
export function createSandboxConfigGenerator(): SandboxConfigGenerator {
  /**
   * Generate sandbox configuration from loaded component
   */
  function generate(
    component: LoadedComponent,
    options: {
      template?: string;
      additionalDependencies?: Record<string, string>;
      exampleCode?: string;
    } = {}
  ): SandboxConfig {
    // Extract dependencies from imports
    const dependencies = extractDependencies(component, options.additionalDependencies);

    // Create files map
    const files = createFiles(component, options.exampleCode);

    return {
      code: options.exampleCode || component.source,
      dependencies,
      files,
      template: options.template || inferTemplate(component),
    };
  }

  /**
   * Generate sandbox configs for multiple components
   */
  function generateMany(
    components: LoadedComponent[],
    options?: {
      template?: string;
      additionalDependencies?: Record<string, string>;
    }
  ): SandboxConfig[] {
    return components.map((component) => generate(component, options));
  }

  return {
    generate,
    generateMany,
  };
}
