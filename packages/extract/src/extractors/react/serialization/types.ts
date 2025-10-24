/**
 * Type and value serialization
 * Pure functions for converting TypeScript AST types and values to string representations
 */

const PRIMITIVE_TYPES: Record<string, string> = {
  TSStringKeyword: "string",
  TSNumberKeyword: "number",
  TSBooleanKeyword: "boolean",
  TSVoidKeyword: "void",
  TSUndefinedKeyword: "undefined",
  TSNullKeyword: "null",
  TSAnyKeyword: "any",
  TSUnknownKeyword: "unknown",
  TSNeverKeyword: "never",
  TSBigIntKeyword: "bigint",
  TSSymbolKeyword: "symbol",
};

export const serializeType = (typeNode: any): string => {
  if (!typeNode) return "any";
  if (PRIMITIVE_TYPES[typeNode.type]) return PRIMITIVE_TYPES[typeNode.type];

  const serializers: Record<string, (n: any) => string> = {
    TSArrayType: (n) => `${serializeType(n.elementType)}[]`,
    TSUnionType: (n) => n.types?.map(serializeType).join(" | ") ?? "unknown",
    TSIntersectionType: (n) =>
      n.types?.map(serializeType).join(" & ") ?? "unknown",
    TSFunctionType: serializeFunctionType,
    TSTypeReference: serializeTypeReference,
    TSTypeLiteral: serializeTypeLiteral,
    TSTupleType: (n) =>
      `[${
        n.elementTypes
          ?.map((e: any) => serializeType(e.type || e))
          .join(", ") ?? ""
      }]`,
    TSLiteralType: (n) => serializeValue(n.literal),
    TSParenthesizedType: (n) => `(${serializeType(n.typeAnnotation)})`,
    TSTypeQuery: (n) => `typeof ${n.exprName?.name || "unknown"}`,
    TSIndexedAccessType: (n) =>
      `${serializeType(n.objectType)}[${serializeType(n.indexType)}]`,
    TSConditionalType: serializeConditionalType,
    TSMappedType: serializeMappedType,
    TSRestType: (n) => `...${serializeType(n.typeAnnotation)}`,
    TSOptionalType: (n) => `${serializeType(n.typeAnnotation)}?`,
  };

  return serializers[typeNode.type]?.(typeNode) ?? "unknown";
};

const serializeFunctionType = (node: any): string => {
  const params = node.params || [];
  const paramStrs = params.map((p: any) => {
    const name = p.name || "arg";
    const type = p.typeAnnotation?.typeAnnotation
      ? serializeType(p.typeAnnotation.typeAnnotation)
      : "any";
    const optional = p.optional ? "?" : "";
    return `${name}${optional}: ${type}`;
  });

  const returnType = node.returnType?.typeAnnotation
    ? serializeType(node.returnType.typeAnnotation)
    : "void";

  return `(${paramStrs.join(", ")}) => ${returnType}`;
};

const serializeTypeReference = (node: any): string => {
  const typeName = node.typeName?.name || "unknown";

  // oxc-parser uses 'typeArguments' for type references (e.g., Foo<Bar>)
  // and 'typeParameters' for type declarations (e.g., class Foo<T>)
  const typeArgs = node.typeArguments || node.typeParameters;

  if (typeArgs?.params?.length > 0) {
    const typeParams = typeArgs.params.map(serializeType).join(", ");
    return `${typeName}<${typeParams}>`;
  }

  return typeName;
};

const serializeTypeLiteral = (node: any): string => {
  if (!node.members?.length) return "{}";

  const memberStrs = node.members
    .filter((m: any) => m.type === "TSPropertySignature")
    .map((m: any) => {
      const key = m.key?.name || "unknown";
      const optional = m.optional ? "?" : "";
      const type = m.typeAnnotation?.typeAnnotation
        ? serializeType(m.typeAnnotation.typeAnnotation)
        : "any";
      return `${key}${optional}: ${type}`;
    });

  return `{ ${memberStrs.join("; ")} }`;
};

const serializeConditionalType = (node: any): string => {
  const checkType = serializeType(node.checkType);
  const extendsType = serializeType(node.extendsType);
  const trueType = serializeType(node.trueType);
  const falseType = serializeType(node.falseType);
  return `${checkType} extends ${extendsType} ? ${trueType} : ${falseType}`;
};

const serializeMappedType = (node: any): string => {
  const typeParam = node.typeParameter?.name?.name || "K";
  const type = node.typeAnnotation ? serializeType(node.typeAnnotation) : "any";
  return `{ [${typeParam}]: ${type} }`;
};

export const serializeValue = (node: any): string => {
  if (!node) return "";

  const serializers: Record<string, (n: any) => string> = {
    // Generic Literal type (used by oxc-parser)
    Literal: (n) => {
      if (typeof n.value === "string") return n.value;
      if (typeof n.value === "number") return String(n.value);
      if (typeof n.value === "boolean") return String(n.value);
      if (n.value === null) return "null";
      return String(n.value);
    },

    // Specific literal types (kept for compatibility)
    StringLiteral: (n) => n.value,
    NumericLiteral: (n) => String(n.value),
    BooleanLiteral: (n) => String(n.value),
    NullLiteral: () => "null",
    Identifier: (n) => n.name,

    // Template literals
    TemplateLiteral: (n) => {
      if (!n.quasis?.length) return "``";
      if (n.expressions?.length === 0) {
        return `\`${n.quasis[0]?.value?.raw || ""}\``;
      }
      return "`${...}`"; // Simplified representation for complex templates
    },

    // Arrays
    ArrayExpression: (n) => {
      if (!n.elements?.length) return "[]";
      const elements = n.elements
        .map((el: any) => (el ? serializeValue(el) : ""))
        .filter(Boolean);
      return `[${elements.join(", ")}]`;
    },

    // Objects
    ObjectExpression: (n) => {
      if (!n.properties?.length) return "{}";
      const props = n.properties
        .filter(
          (p: any) => p.type === "Property" || p.type === "ObjectProperty"
        )
        .map((p: any) => {
          const key =
            p.key?.name ||
            (p.key?.type === "StringLiteral" ? `"${p.key.value}"` : "");
          const value = serializeValue(p.value);
          return key && value ? `${key}: ${value}` : "";
        })
        .filter(Boolean);
      return `{ ${props.join(", ")} }`;
    },

    // Arrow functions
    ArrowFunctionExpression: () => "() => {}",
    FunctionExpression: () => "function() {}",

    // Binary/Unary expressions
    BinaryExpression: (n) =>
      `${serializeValue(n.left)} ${n.operator} ${serializeValue(n.right)}`,
    UnaryExpression: (n) => `${n.operator}${serializeValue(n.argument)}`,

    // Logical expressions
    LogicalExpression: (n) =>
      `${serializeValue(n.left)} ${n.operator} ${serializeValue(n.right)}`,

    // Conditional
    ConditionalExpression: (n) =>
      `${serializeValue(n.test)} ? ${serializeValue(
        n.consequent
      )} : ${serializeValue(n.alternate)}`,

    // Member access
    MemberExpression: (n) => {
      const obj = serializeValue(n.object);
      const prop = n.computed
        ? `[${serializeValue(n.property)}]`
        : `.${n.property?.name || ""}`;
      return `${obj}${prop}`;
    },

    // Call expressions
    CallExpression: (n) => {
      const callee = serializeValue(n.callee);
      const args = n.arguments?.map(serializeValue).join(", ") || "";
      return `${callee}(${args})`;
    },

    // New expressions
    NewExpression: (n) => {
      const callee = serializeValue(n.callee);
      const args = n.arguments?.map(serializeValue).join(", ") || "";
      return `new ${callee}(${args})`;
    },

    // Spread/Rest
    SpreadElement: (n) => `...${serializeValue(n.argument)}`,

    // JSX (for default values that are JSX)
    JSXElement: () => "<jsx>",
    JSXFragment: () => "<>",

    // Regex
    RegExpLiteral: (n) => `/${n.pattern || ""}/${n.flags || ""}`,

    // BigInt
    BigIntLiteral: (n) => `${n.value}n`,

    // Undefined
    UndefinedKeyword: () => "undefined",
  };

  return serializers[node.type]?.(node) ?? "";
};
