/**
 * Component extraction
 * Main logic for extracting React component metadata from AST
 */

import { Visitor } from "oxc-parser";
import type { ComponentMetadata, PropMetadata } from "../../../types.js";
import { isReactComponent, isArrowOrFunction, hasJSXReturn } from "../utils/type-guards.js";
import { extractPropsFromParams } from "./props.js";
import { extractJSDoc } from "../utils/jsdoc.js";
import { buildTypeRegistry, TypeRegistry } from "../utils/type-resolver.js";

export const extractComponents = (
  program: any,
  filePath: string,
  content: string
): ComponentMetadata[] => {
  const components: ComponentMetadata[] = [];
  const processedNames = new Set<string>();

  // Build type registry for resolving type references
  const typeRegistry = buildTypeRegistry(program);

  const addComponent = (component: ComponentMetadata | null) => {
    if (component && !processedNames.has(component.name)) {
      components.push(component);
      processedNames.add(component.name);
    }
  };

  const visitor = new Visitor({
    FunctionDeclaration: (node: any) =>
      addComponent(extractFunctionComponent(node, filePath, content, typeRegistry)),

    "VariableDeclaration:exit": (node: any) =>
      node.declarations?.forEach((declarator: any) =>
        addComponent(extractVariableComponent(declarator, filePath, content, typeRegistry, "named", node))
      ),

    "ExportDefaultDeclaration:exit": (node: any) => {
      const declaration = node.declaration;
      if (!declaration) return;

      if (declaration.type === "FunctionDeclaration") {
        addComponent(
          extractFunctionComponent(declaration, filePath, content, typeRegistry, "default")
        );
      } else if (declaration.type === "Identifier") {
        const existing = components.find((c) => c.name === declaration.name);
        if (existing) existing.exportType = "default";
      } else if (isArrowOrFunction(declaration) && hasJSXReturn(declaration)) {
        const propsResult = extractPropsFromParams(declaration.params || [], typeRegistry);
        addComponent({
          type: "component",
          name: "default",
          filePath,
          exportType: "default",
          props: propsResult.props,
          ...(propsResult.extends && { extends: propsResult.extends }),
        });
      }
    },

    "ExportNamedDeclaration:exit": (node: any) => {
      const declaration = node.declaration;
      if (!declaration) return;

      if (declaration.type === "FunctionDeclaration") {
        addComponent(
          extractFunctionComponent(declaration, filePath, content, typeRegistry, "named")
        );
      } else if (declaration.type === "VariableDeclaration") {
        declaration.declarations?.forEach((declarator: any) =>
          addComponent(
            extractVariableComponent(declarator, filePath, content, typeRegistry, "named", node)
          )
        );
      }
    },
  });

  visitor.visit(program);
  return components;
};

const extractFunctionComponent = (
  node: any,
  filePath: string,
  content: string,
  typeRegistry: TypeRegistry,
  exportType: "default" | "named" = "named"
): ComponentMetadata | null => {
  const name = node?.id?.name;

  return isReactComponent(name, node)
    ? createComponentMetadata(
        name,
        filePath,
        exportType,
        node.params,
        node,
        content,
        typeRegistry
      )
    : null;
};

const extractVariableComponent = (
  declarator: any,
  filePath: string,
  content: string,
  typeRegistry: TypeRegistry,
  exportType: "default" | "named" = "named",
  parentNode?: any
): ComponentMetadata | null => {
  const name = declarator?.id?.name;
  const funcNode = declarator?.init;

  if (!funcNode || !isArrowOrFunction(funcNode)) return null;

  return isReactComponent(name, funcNode)
    ? createComponentMetadata(
        name,
        filePath,
        exportType,
        funcNode.params,
        parentNode || declarator,
        content,
        typeRegistry
      )
    : null;
};

const createComponentMetadata = (
  name: string,
  filePath: string,
  exportType: "default" | "named",
  params: any[],
  node: any,
  content: string,
  typeRegistry: TypeRegistry
): ComponentMetadata => {
  const propsResult = extractPropsFromParams(params || [], typeRegistry);
  const jsdoc = extractJSDoc(node, content);

  // Enrich props with descriptions from @param tags
  if (jsdoc?.paramDescriptions) {
    propsResult.props.forEach((prop: PropMetadata) => {
      const paramDesc = jsdoc.paramDescriptions!.get(prop.name);
      if (paramDesc && !prop.description) {
        prop.description = paramDesc;
      }
    });
  }

  // Convert prop examples to JSX format
  propsResult.props.forEach((prop: PropMetadata) => {
    if (prop.examples) {
      prop.examples = prop.examples.map(value => {
        // For function types, show the prop without a value (event handlers)
        if (prop.type.includes("=>") || prop.type.includes("function")) {
          return `<${name} ${prop.name}={${value}} />`;
        }
        // For boolean types
        if (prop.type.toLowerCase() === "boolean") {
          if (value === "true") {
            return `<${name} ${prop.name} />`;
          }
          return `<${name} ${prop.name}={false} />`;
        }
        // For string types, use quotes
        if (prop.type.toLowerCase() === "string") {
          return `<${name} ${prop.name}="${value}" />`;
        }
        // For other types (numbers, objects, etc), use braces
        return `<${name} ${prop.name}={${value}} />`;
      });
    }
  });

  const metadata: ComponentMetadata = {
    type: "component",
    name,
    filePath,
    exportType,
    props: propsResult.props,
  };

  // Add JSDoc fields if present
  if (jsdoc?.description) metadata.description = jsdoc.description;
  if (jsdoc?.deprecated !== undefined) metadata.deprecated = jsdoc.deprecated;
  if (jsdoc?.returns) metadata.returns = jsdoc.returns;
  if (jsdoc?.see?.length) metadata.links = jsdoc.see;
  if (jsdoc?.since) metadata.since = jsdoc.since;
  if (jsdoc?.examples?.length) metadata.examples = jsdoc.examples;

  // Add extends field if type references couldn't be resolved
  if (propsResult.extends?.length) metadata.extends = propsResult.extends;

  return metadata;
};
