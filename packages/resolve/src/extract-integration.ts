import type { ComponentMetadata, PropMetadata } from "@tapestrylab/extract";
import type { ComponentDoc, PropDoc, ExampleDoc } from "./component-types.js";

/**
 * Convert extract PropMetadata to PropDoc
 */
function toPropDoc(prop: PropMetadata): PropDoc {
  return {
    name: prop.name,
    type: prop.type,
    description: prop.description,
    required: prop.required,
    defaultValue: prop.defaultValue,
  };
}

/**
 * Convert example string to ExampleDoc
 */
function toExampleDoc(example: string): ExampleDoc {
  return {
    code: example,
    language: "tsx", // Default to TSX for React components
  };
}

/**
 * Convert extract ComponentMetadata to ComponentDoc
 */
export function toComponentDoc(
  metadata: ComponentMetadata,
  options: {
    previewHtml?: string;
    sandbox?: any;
  } = {}
): ComponentDoc {
  return {
    name: metadata.name,
    description: metadata.description,
    filePath: metadata.filePath,
    props: metadata.props.map(toPropDoc),
    examples: metadata.examples?.map(toExampleDoc) ?? [],
    imports: [], // Will be populated by ComponentLoader
    previewHtml: options.previewHtml,
    sandbox: options.sandbox,
  };
}

/**
 * Convert multiple ComponentMetadata to ComponentDocs
 */
export function toComponentDocs(
  metadata: ComponentMetadata[],
  options?: {
    previewHtml?: Record<string, string>;
    sandbox?: Record<string, any>;
  }
): ComponentDoc[] {
  return metadata.map((meta) =>
    toComponentDoc(meta, {
      previewHtml: options?.previewHtml?.[meta.name],
      sandbox: options?.sandbox?.[meta.name],
    })
  );
}
