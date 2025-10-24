/**
 * Props extraction
 * Pure functions for extracting component props metadata from function parameters
 */

import type { PropMetadata } from "../../../types.js";
import { serializeType, serializeValue } from "../serialization/types.js";
import { TypeRegistry, resolveTypeAnnotation } from "../utils/type-resolver.js";

export interface PropsExtractionResult {
  props: PropMetadata[];
  extends?: string[]; // Type references that couldn't be expanded
}

/**
 * Generate example values for a prop based on its type and name
 */
const generatePropExamples = (propName: string, typeString: string, defaultValue?: string): string[] | undefined => {
  const examplesSet = new Set<string>();

  // Add default value as first example if it exists
  if (defaultValue) {
    examplesSet.add(defaultValue);
  }

  // Handle union types: extract all members
  if (typeString.includes("|")) {
    const unionMembers = typeString
      .split("|")
      .map((t) => t.trim())
      .filter((t) => t && t !== "undefined" && t !== "null");

    // Add each union member as an example (skip if it's a complex type)
    unionMembers.forEach((member) => {
      // Strip quotes for string literals
      const cleaned = member.replace(/^["']|["']$/g, "");
      if (!member.includes("(") && !member.includes("{")) {
        examplesSet.add(cleaned);
      }
    });

    if (examplesSet.size > 0) return Array.from(examplesSet);
  }

  // For basic types, generate one example based on type (only if no default)
  const lowerType = typeString.toLowerCase();

  if (lowerType === "string" && !defaultValue) {
    // Generate a contextual string example based on prop name
    const name = propName.toLowerCase();
    if (name.includes("name")) {
      examplesSet.add("John Doe");
    } else if (name.includes("title") || name.includes("label") || name.includes("text")) {
      examplesSet.add("Click me");
    } else if (name.includes("id")) {
      examplesSet.add("user-123");
    } else if (name.includes("url") || name.includes("link")) {
      examplesSet.add("https://example.com");
    } else if (name.includes("email")) {
      examplesSet.add("user@example.com");
    } else if (name.includes("class")) {
      examplesSet.add("btn-primary");
    } else {
      examplesSet.add("Example value");
    }
  } else if (lowerType === "number" && !defaultValue) {
    examplesSet.add("42");
  } else if (lowerType === "boolean") {
    examplesSet.add("true");
    examplesSet.add("false");
  } else if (typeString.includes("=>") || typeString.includes("function")) {
    // Function type: provide one example
    // Try to keep it simple and use the actual type string if it's short
    if (typeString.length < 50) {
      examplesSet.add(typeString);
    } else {
      examplesSet.add("() => void");
    }
  }

  return examplesSet.size > 0 ? Array.from(examplesSet) : undefined;
};

export const extractPropsFromParams = (
  params: any[],
  registry?: TypeRegistry
): PropsExtractionResult => {
  if (!params?.length) return { props: [] };

  const firstParam = params[0];
  if (!firstParam) return { props: [] };

  if (firstParam.type === "ObjectPattern") {
    const typeAnnotation = firstParam.typeAnnotation?.typeAnnotation;

    if (typeAnnotation) {
      // We have a type annotation - resolve it if it's a type reference
      if (typeAnnotation.type === "TSTypeReference" && registry) {
        // Resolve the type reference first
        const resolved = resolveTypeAnnotation(typeAnnotation, registry);
        if (resolved && resolved !== typeAnnotation) {
          // Successfully resolved - extract props from the resolved type
          const result = extractPropsFromTypeAnnotation(resolved, registry);

          // Merge default values from the destructured pattern
          const defaultsMap = extractDefaultsFromPattern(firstParam);
          result.props = result.props.map(prop => {
            const defaultValue = defaultsMap.get(prop.name);
            if (defaultValue !== undefined) {
              // Regenerate examples with the default value
              const examples = generatePropExamples(prop.name, prop.type, defaultValue);
              return {
                ...prop,
                defaultValue,
                required: false, // Has default, so not required
                ...(examples && { examples }),
              };
            }
            return prop;
          });

          return result;
        }
      }

      // For type literals or unresolved references, use the existing logic
      if (typeAnnotation.type === "TSTypeLiteral") {
        return { props: extractPropsFromPatternWithType(firstParam, typeAnnotation) };
      }

      // Try extracting from the type annotation directly
      return extractPropsFromTypeAnnotation(typeAnnotation, registry);
    }

    // No type annotation - extract from pattern only
    return { props: extractPropsFromPattern(firstParam) };
  }

  if (firstParam.type === "Identifier" && firstParam.typeAnnotation) {
    return extractPropsFromTypeAnnotation(
      firstParam.typeAnnotation.typeAnnotation,
      registry
    );
  }

  return { props: [] };
};

/**
 * Extract default values from a destructured pattern
 */
const extractDefaultsFromPattern = (pattern: any): Map<string, string> => {
  const defaults = new Map<string, string>();

  (pattern.properties || [])
    .filter(isPropertyWithKey)
    .forEach((prop: any) => {
      const name = prop.key.name;
      const value = prop.value;
      if (value?.type === "AssignmentPattern") {
        defaults.set(name, serializeValue(value.right));
      }
    });

  return defaults;
};

const extractPropsFromPatternWithType = (
  pattern: any,
  typeAnnotation: any
): PropMetadata[] => {
  const typeMap = createTypeMap(typeAnnotation.members || []);

  return (pattern.properties || [])
    .filter(isPropertyWithKey)
    .map((prop: any) => createPropWithType(prop, typeMap));
};

const extractPropsFromPattern = (pattern: any): PropMetadata[] =>
  (pattern.properties || [])
    .filter(isPropertyWithKey)
    .map(createPropWithoutType);

const extractPropsFromTypeAnnotation = (
  typeAnnotation: any,
  registry?: TypeRegistry
): PropsExtractionResult => {
  if (!typeAnnotation) return { props: [] };

  // Handle type references - resolve them first
  if (typeAnnotation.type === "TSTypeReference") {
    const typeName = typeAnnotation.typeName?.name;

    // If we have a registry, try to resolve the type
    if (registry && typeName) {
      const resolved = resolveTypeAnnotation(typeAnnotation, registry);
      if (resolved && resolved !== typeAnnotation) {
        // Successfully resolved, extract from the resolved type
        return extractPropsFromTypeAnnotation(resolved, registry);
      }
    }

    // Can't resolve - return empty props
    return { props: [] };
  }

  // Handle intersection types (e.g., { a: string } & ExternalType)
  if (typeAnnotation.type === "TSIntersectionType") {
    const allProps: PropMetadata[] = [];
    const extendsTypes: string[] = [];

    for (const member of typeAnnotation.types || []) {
      if (member.type === "TSTypeLiteral") {
        // Inline type literal - extract props directly
        const props = extractPropsFromTypeLiteral(member);
        allProps.push(...props);
      } else if (member.type === "TSTypeReference") {
        const typeName = member.typeName?.name;

        // Try to resolve if we have a registry
        if (registry && typeName) {
          const resolved = resolveTypeAnnotation(member, registry);
          if (resolved && resolved !== member) {
            // Successfully resolved - extract props
            const result = extractPropsFromTypeAnnotation(resolved, registry);
            allProps.push(...result.props);
            if (result.extends) {
              extendsTypes.push(...result.extends);
            }
          } else {
            // Can't resolve - add to extends
            extendsTypes.push(serializeType(member));
          }
        } else {
          // No registry or no type name - add to extends
          extendsTypes.push(serializeType(member));
        }
      } else {
        // Other types - try to resolve recursively
        const result = extractPropsFromTypeAnnotation(member, registry);
        allProps.push(...result.props);
        if (result.extends) {
          extendsTypes.push(...result.extends);
        }
      }
    }

    return {
      props: allProps,
      ...(extendsTypes.length > 0 && { extends: extendsTypes }),
    };
  }

  // Handle type literals directly
  if (typeAnnotation.type === "TSTypeLiteral") {
    return { props: extractPropsFromTypeLiteral(typeAnnotation) };
  }

  // Handle interface body (from resolved interface)
  if (typeAnnotation.type === "TSInterfaceBody") {
    return { props: extractPropsFromTypeLiteral(typeAnnotation) };
  }

  return { props: [] };
};

/**
 * Extract props from a type literal or interface body
 */
const extractPropsFromTypeLiteral = (node: any): PropMetadata[] => {
  return (node.members || node.body?.body || [])
    .filter((m: any) => m.type === "TSPropertySignature" && m.key?.name)
    .map((m: any) => {
      const name = m.key.name;
      const typeString = serializeType(m.typeAnnotation?.typeAnnotation);
      const examples = generatePropExamples(name, typeString);

      return {
        name,
        type: typeString,
        required: !m.optional,
        ...(examples && { examples }),
      };
    });
};

const createTypeMap = (members: any[]): Map<string, any> =>
  new Map(
    members
      .filter((m: any) => m.type === "TSPropertySignature" && m.key?.name)
      .map((m: any) => [
        m.key.name,
        {
          typeAnnotation: m.typeAnnotation?.typeAnnotation,
          optional: m.optional ?? false,
        },
      ])
  );

const isPropertyWithKey = (prop: any): boolean =>
  prop?.type === "Property" && !!prop.key?.name;

const createPropWithType = (
  prop: any,
  typeMap: Map<string, any>
): PropMetadata => {
  const name = prop.key.name;
  const value = prop.value;
  const hasDefault = value?.type === "AssignmentPattern";
  const typeInfo = typeMap.get(name);
  const typeString = typeInfo?.typeAnnotation
    ? serializeType(typeInfo.typeAnnotation)
    : "any";
  const defaultValue = hasDefault ? serializeValue(value.right) : undefined;

  const examples = generatePropExamples(name, typeString, defaultValue);

  return {
    name,
    type: typeString,
    required: !hasDefault && !typeInfo?.optional,
    ...(defaultValue && { defaultValue }),
    ...(examples && { examples }),
  };
};

const createPropWithoutType = (prop: any): PropMetadata => {
  const name = prop.key.name;
  const value = prop.value;
  const hasDefault = value?.type === "AssignmentPattern";
  const typeString = value?.typeAnnotation?.typeAnnotation
    ? serializeType(value.typeAnnotation.typeAnnotation)
    : "any";
  const defaultValue = hasDefault ? serializeValue(value.right) : undefined;

  const examples = generatePropExamples(name, typeString, defaultValue);

  return {
    name,
    type: typeString,
    required: !hasDefault && !value?.optional,
    ...(defaultValue && { defaultValue }),
    ...(examples && { examples }),
  };
};
