import type { ComponentMetadata, PropMetadata } from "@tapestrylab/extract";
import type { ComponentDoc, PropDoc, ExampleDoc } from "./component-types.js";

/**
 * ExtractIntegration handles conversion between @tapestrylab/extract
 * metadata and the ComponentDoc format used by resolver
 */
export class ExtractIntegration {
  /**
   * Convert extract ComponentMetadata to ComponentDoc
   */
  static toComponentDoc(
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
      props: metadata.props.map(this.toPropDoc),
      examples: metadata.examples?.map(this.toExampleDoc) ?? [],
      imports: [], // Will be populated by ComponentLoader
      previewHtml: options.previewHtml,
      sandbox: options.sandbox,
    };
  }

  /**
   * Convert extract PropMetadata to PropDoc
   */
  private static toPropDoc(prop: PropMetadata): PropDoc {
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
  private static toExampleDoc(example: string): ExampleDoc {
    return {
      code: example,
      language: "tsx", // Default to TSX for React components
    };
  }

  /**
   * Convert multiple ComponentMetadata to ComponentDocs
   */
  static toComponentDocs(
    metadata: ComponentMetadata[],
    options?: {
      previewHtml?: Record<string, string>;
      sandbox?: Record<string, any>;
    }
  ): ComponentDoc[] {
    return metadata.map((meta) =>
      this.toComponentDoc(meta, {
        previewHtml: options?.previewHtml?.[meta.name],
        sandbox: options?.sandbox?.[meta.name],
      })
    );
  }
}
