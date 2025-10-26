/**
 * Type resolution utilities
 * Resolves TypeScript type references to their definitions for prop extraction
 */

import { Visitor } from "oxc-parser";

export interface TypeDefinition {
  name: string;
  node: any; // The actual type node (TSTypeAliasDeclaration, TSInterfaceDeclaration, etc.)
}

export interface TypeRegistry {
  /**
   * Resolve a type reference by name
   */
  resolve(typeName: string): any | undefined;

  /**
   * Check if a type is registered
   */
  has(typeName: string): boolean;
}

/**
 * Build a registry of all type and interface declarations in the program
 */
export const buildTypeRegistry = (program: any): TypeRegistry => {
  const types = new Map<string, any>();

  const register = (name: string, node: any): void => {
    types.set(name, node);
  };

  const visitor = new Visitor({
    "TSTypeAliasDeclaration": (node: any) => {
      if (node.id?.name) {
        register(node.id.name, node.typeAnnotation);
      }
    },
    "TSInterfaceDeclaration": (node: any) => {
      if (node.id?.name) {
        register(node.id.name, node);
      }
    },
  });

  visitor.visit(program);

  return {
    resolve(typeName: string): any | undefined {
      return types.get(typeName);
    },

    has(typeName: string): boolean {
      return types.has(typeName);
    },
  };
};

/**
 * Resolve a type annotation, following type references
 * Returns the resolved type node or undefined if it cannot be resolved
 */
export const resolveTypeAnnotation = (
  typeNode: any,
  registry: TypeRegistry,
  visited = new Set<string>()
): any => {
  if (!typeNode) return undefined;

  // If it's a type reference, try to resolve it
  if (typeNode.type === "TSTypeReference") {
    const typeName = typeNode.typeName?.name;
    if (!typeName) return typeNode;

    // Prevent infinite recursion
    if (visited.has(typeName)) return undefined;
    visited.add(typeName);

    const resolved = registry.resolve(typeName);
    if (!resolved) return typeNode; // Can't resolve, return original

    // Recursively resolve the resolved type
    return resolveTypeAnnotation(resolved, registry, visited);
  }

  // For intersection types, we need to resolve each member
  if (typeNode.type === "TSIntersectionType") {
    return {
      ...typeNode,
      types: typeNode.types?.map((t: any) => resolveTypeAnnotation(t, registry, visited)),
    };
  }

  // For union types, resolve each member
  if (typeNode.type === "TSUnionType") {
    return {
      ...typeNode,
      types: typeNode.types?.map((t: any) => resolveTypeAnnotation(t, registry, visited)),
    };
  }

  // For interfaces, extract the body
  if (typeNode.type === "TSInterfaceDeclaration") {
    return typeNode.body;
  }

  return typeNode;
};
