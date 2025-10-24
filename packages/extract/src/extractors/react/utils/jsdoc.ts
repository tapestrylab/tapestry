/**
 * JSDoc comment extraction and parsing
 * Pure functions for extracting structured JSDoc information from comments
 */

export interface ParsedJSDoc {
  description?: string;
  deprecated?: string | boolean;
  returns?: string;
  see?: string[];
  since?: string;
  examples?: string[]; // @example tags for component-level usage examples
  paramDescriptions?: Map<string, string>; // param name -> description
}

/**
 * Extract and parse full JSDoc comment from a node
 */
export const extractJSDoc = (
  node: any,
  content: string
): ParsedJSDoc | undefined => {
  const rawComment = extractRawJSDocComment(node, content);
  if (!rawComment) return undefined;

  return parseJSDoc(rawComment);
};

/**
 * Extract the raw JSDoc comment text before a node
 */
const extractRawJSDocComment = (
  node: any,
  content: string
): string | undefined => {
  // oxc-parser AST nodes have start/end properties directly, not nested in a span object
  const nodeStart = node.start ?? node.span?.start;
  if (nodeStart === undefined) return undefined;

  const beforeCode = content.substring(0, nodeStart);
  // Allow for export/default keywords between JSDoc comment and the declaration
  // Use negative lookahead to match only within a single JSDoc block
  const jsDocMatch = beforeCode.match(
    /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/(?:\s|export\s+|default\s+)*$/
  );

  return jsDocMatch ? jsDocMatch[1] : undefined;
};

/**
 * Parse JSDoc comment text into structured data
 */
const parseJSDoc = (rawComment: string): ParsedJSDoc => {
  const lines = rawComment
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter((line) => line);

  const result: ParsedJSDoc = {
    paramDescriptions: new Map(),
  };

  const descriptionLines: string[] = [];
  let currentTagName: string | null = null;
  let currentParamName: string | null = null;
  const currentExampleLines: string[] = [];

  for (const line of lines) {
    // Check if this line starts a new tag
    const tagMatch = line.match(/^@(\w+)(?:\s+(.*))?$/);

    if (tagMatch) {
      const [, tagName, tagContent = ""] = tagMatch;

      // If we were collecting an example, save it before moving to the next tag
      if (currentTagName === "example" && currentExampleLines.length > 0) {
        if (!result.examples) result.examples = [];
        result.examples.push(currentExampleLines.join("\n").trim());
        currentExampleLines.length = 0;
      }

      currentTagName = tagName;
      currentParamName = null;

      // Parse tag-specific content
      if (tagName === "param" || tagName === "property") {
        // @param {type} name - description
        const paramMatch = tagContent.match(
          /^(?:\{([^}]+)\}\s+)?(\w+)(?:\s+-?\s*(.*))?$/
        );
        if (paramMatch) {
          const [, , name, description] = paramMatch;
          currentParamName = name;

          // Store param descriptions separately for easy lookup
          if (name && description) {
            result.paramDescriptions!.set(name, description);
          }
        }
      } else if (tagName === "deprecated") {
        result.deprecated = tagContent || true;
      } else if (tagName === "see") {
        if (!result.see) result.see = [];
        // Strip {@link ...} wrapper if present, extract just the URL
        const linkMatch =
          tagContent.match(/\{@link\s+([^}]+)\}/) || tagContent.match(/^(\S+)/);
        result.see.push(linkMatch ? linkMatch[1].trim() : tagContent);
      } else if (tagName === "since") {
        result.since = tagContent;
      } else if (tagName === "example") {
        // Start collecting example content
        if (tagContent) currentExampleLines.push(tagContent);
      }
    } else if (currentTagName === "example") {
      // Collect example content lines
      currentExampleLines.push(line);
    } else if (currentTagName) {
      // Continue previous tag's description
      if (currentTagName === "returns" || currentTagName === "return") {
        result.returns = (result.returns || "") + " " + line;
      } else if (
        (currentTagName === "param" || currentTagName === "property") &&
        currentParamName
      ) {
        const existingDesc = result.paramDescriptions!.get(currentParamName);
        result.paramDescriptions!.set(
          currentParamName,
          (existingDesc || "") + " " + line
        );
      }
    } else {
      // Description line (before any tags)
      descriptionLines.push(line);
    }
  }

  // Save any remaining example at the end
  if (currentTagName === "example" && currentExampleLines.length > 0) {
    if (!result.examples) result.examples = [];
    result.examples.push(currentExampleLines.join("\n").trim());
  }

  // Set description
  if (descriptionLines.length > 0) {
    result.description = descriptionLines.join(" ");
  }

  // Clean up empty maps
  if (result.paramDescriptions?.size === 0) delete result.paramDescriptions;

  return result;
};
