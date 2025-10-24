import { describe, it, expect } from "vitest";
import { serializeType, serializeValue } from "./types.js";

describe("serializeType", () => {
  describe("primitive types", () => {
    it("should serialize string keyword", () => {
      expect(serializeType({ type: "TSStringKeyword" })).toBe("string");
    });

    it("should serialize number keyword", () => {
      expect(serializeType({ type: "TSNumberKeyword" })).toBe("number");
    });

    it("should serialize boolean keyword", () => {
      expect(serializeType({ type: "TSBooleanKeyword" })).toBe("boolean");
    });

    it("should serialize void keyword", () => {
      expect(serializeType({ type: "TSVoidKeyword" })).toBe("void");
    });

    it("should serialize undefined keyword", () => {
      expect(serializeType({ type: "TSUndefinedKeyword" })).toBe("undefined");
    });

    it("should serialize null keyword", () => {
      expect(serializeType({ type: "TSNullKeyword" })).toBe("null");
    });

    it("should serialize any keyword", () => {
      expect(serializeType({ type: "TSAnyKeyword" })).toBe("any");
    });

    it("should serialize unknown keyword", () => {
      expect(serializeType({ type: "TSUnknownKeyword" })).toBe("unknown");
    });

    it("should serialize never keyword", () => {
      expect(serializeType({ type: "TSNeverKeyword" })).toBe("never");
    });

    it("should serialize bigint keyword", () => {
      expect(serializeType({ type: "TSBigIntKeyword" })).toBe("bigint");
    });

    it("should serialize symbol keyword", () => {
      expect(serializeType({ type: "TSSymbolKeyword" })).toBe("symbol");
    });

    it("should return any for null/undefined", () => {
      expect(serializeType(null)).toBe("any");
      expect(serializeType(undefined)).toBe("any");
    });
  });

  describe("array types", () => {
    it("should serialize simple array type", () => {
      const node = {
        type: "TSArrayType",
        elementType: { type: "TSStringKeyword" },
      };
      expect(serializeType(node)).toBe("string[]");
    });

    it("should serialize nested array type", () => {
      const node = {
        type: "TSArrayType",
        elementType: {
          type: "TSArrayType",
          elementType: { type: "TSNumberKeyword" },
        },
      };
      expect(serializeType(node)).toBe("number[][]");
    });
  });

  describe("union types", () => {
    it("should serialize simple union", () => {
      const node = {
        type: "TSUnionType",
        types: [{ type: "TSStringKeyword" }, { type: "TSNumberKeyword" }],
      };
      expect(serializeType(node)).toBe("string | number");
    });

    it("should serialize union with multiple types", () => {
      const node = {
        type: "TSUnionType",
        types: [
          { type: "TSStringKeyword" },
          { type: "TSNumberKeyword" },
          { type: "TSBooleanKeyword" },
        ],
      };
      expect(serializeType(node)).toBe("string | number | boolean");
    });

    it("should handle union without types", () => {
      const node = { type: "TSUnionType" };
      expect(serializeType(node)).toBe("unknown");
    });
  });

  describe("intersection types", () => {
    it("should serialize simple intersection", () => {
      const node = {
        type: "TSIntersectionType",
        types: [
          {
            type: "TSTypeLiteral",
            members: [
              {
                type: "TSPropertySignature",
                key: { name: "a" },
                typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
              },
            ],
          },
          {
            type: "TSTypeLiteral",
            members: [
              {
                type: "TSPropertySignature",
                key: { name: "b" },
                typeAnnotation: { typeAnnotation: { type: "TSNumberKeyword" } },
              },
            ],
          },
        ],
      };
      expect(serializeType(node)).toBe("{ a: string } & { b: number }");
    });

    it("should handle intersection without types", () => {
      const node = { type: "TSIntersectionType" };
      expect(serializeType(node)).toBe("unknown");
    });
  });

  describe("tuple types", () => {
    it("should serialize simple tuple", () => {
      const node = {
        type: "TSTupleType",
        elementTypes: [
          { type: { type: "TSStringKeyword" } },
          { type: { type: "TSNumberKeyword" } },
        ],
      };
      expect(serializeType(node)).toBe("[string, number]");
    });

    it("should serialize empty tuple", () => {
      const node = {
        type: "TSTupleType",
        elementTypes: [],
      };
      expect(serializeType(node)).toBe("[]");
    });

    it("should handle tuple without elementTypes", () => {
      const node = { type: "TSTupleType" };
      expect(serializeType(node)).toBe("[]");
    });
  });

  describe("literal types", () => {
    it("should serialize string literal", () => {
      const node = {
        type: "TSLiteralType",
        literal: { type: "StringLiteral", value: "hello" },
      };
      expect(serializeType(node)).toBe("hello");
    });

    it("should serialize number literal", () => {
      const node = {
        type: "TSLiteralType",
        literal: { type: "NumericLiteral", value: 42 },
      };
      expect(serializeType(node)).toBe("42");
    });

    it("should serialize boolean literal", () => {
      const node = {
        type: "TSLiteralType",
        literal: { type: "BooleanLiteral", value: true },
      };
      expect(serializeType(node)).toBe("true");
    });
  });

  describe("type references", () => {
    it("should serialize simple type reference", () => {
      const node = {
        type: "TSTypeReference",
        typeName: { name: "User" },
      };
      expect(serializeType(node)).toBe("User");
    });

    it("should serialize generic type reference", () => {
      const node = {
        type: "TSTypeReference",
        typeName: { name: "Array" },
        typeParameters: {
          params: [{ type: "TSStringKeyword" }],
        },
      };
      expect(serializeType(node)).toBe("Array<string>");
    });

    it("should serialize type reference with multiple generics", () => {
      const node = {
        type: "TSTypeReference",
        typeName: { name: "Map" },
        typeParameters: {
          params: [{ type: "TSStringKeyword" }, { type: "TSNumberKeyword" }],
        },
      };
      expect(serializeType(node)).toBe("Map<string, number>");
    });
  });

  describe("type literals", () => {
    it("should serialize empty object type", () => {
      const node = {
        type: "TSTypeLiteral",
        members: [],
      };
      expect(serializeType(node)).toBe("{}");
    });

    it("should serialize object type with properties", () => {
      const node = {
        type: "TSTypeLiteral",
        members: [
          {
            type: "TSPropertySignature",
            key: { name: "name" },
            typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
          },
          {
            type: "TSPropertySignature",
            key: { name: "age" },
            typeAnnotation: { typeAnnotation: { type: "TSNumberKeyword" } },
          },
        ],
      };
      expect(serializeType(node)).toBe("{ name: string; age: number }");
    });

    it("should serialize object type with optional property", () => {
      const node = {
        type: "TSTypeLiteral",
        members: [
          {
            type: "TSPropertySignature",
            key: { name: "name" },
            optional: true,
            typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
          },
        ],
      };
      expect(serializeType(node)).toBe("{ name?: string }");
    });

    it("should filter non-property members", () => {
      const node = {
        type: "TSTypeLiteral",
        members: [
          {
            type: "TSPropertySignature",
            key: { name: "name" },
            typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
          },
          { type: "TSCallSignature" }, // Should be filtered out
        ],
      };
      expect(serializeType(node)).toBe("{ name: string }");
    });
  });

  describe("function types", () => {
    it("should serialize function with no params", () => {
      const node = {
        type: "TSFunctionType",
        params: [],
        returnType: { typeAnnotation: { type: "TSVoidKeyword" } },
      };
      expect(serializeType(node)).toBe("() => void");
    });

    it("should serialize function with params", () => {
      const node = {
        type: "TSFunctionType",
        params: [
          {
            name: "x",
            typeAnnotation: { typeAnnotation: { type: "TSNumberKeyword" } },
          },
          {
            name: "y",
            typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
          },
        ],
        returnType: { typeAnnotation: { type: "TSBooleanKeyword" } },
      };
      expect(serializeType(node)).toBe("(x: number, y: string) => boolean");
    });

    it("should serialize function with optional param", () => {
      const node = {
        type: "TSFunctionType",
        params: [
          {
            name: "x",
            optional: true,
            typeAnnotation: { typeAnnotation: { type: "TSNumberKeyword" } },
          },
        ],
        returnType: { typeAnnotation: { type: "TSVoidKeyword" } },
      };
      expect(serializeType(node)).toBe("(x?: number) => void");
    });

    it("should handle function without returnType", () => {
      const node = {
        type: "TSFunctionType",
        params: [],
      };
      expect(serializeType(node)).toBe("() => void");
    });
  });

  describe("other type constructs", () => {
    it("should serialize parenthesized type", () => {
      const node = {
        type: "TSParenthesizedType",
        typeAnnotation: { type: "TSStringKeyword" },
      };
      expect(serializeType(node)).toBe("(string)");
    });

    it("should serialize typeof query", () => {
      const node = {
        type: "TSTypeQuery",
        exprName: { name: "myVariable" },
      };
      expect(serializeType(node)).toBe("typeof myVariable");
    });

    it("should serialize indexed access type", () => {
      const node = {
        type: "TSIndexedAccessType",
        objectType: {
          type: "TSTypeReference",
          typeName: { name: "User" },
        },
        indexType: {
          type: "TSLiteralType",
          literal: { type: "StringLiteral", value: "name" },
        },
      };
      expect(serializeType(node)).toBe("User[name]");
    });

    it("should serialize conditional type", () => {
      const node = {
        type: "TSConditionalType",
        checkType: {
          type: "TSTypeReference",
          typeName: { name: "T" },
        },
        extendsType: { type: "TSStringKeyword" },
        trueType: { type: "TSNumberKeyword" },
        falseType: { type: "TSBooleanKeyword" },
      };
      expect(serializeType(node)).toBe("T extends string ? number : boolean");
    });

    it("should serialize mapped type", () => {
      const node = {
        type: "TSMappedType",
        typeParameter: { name: { name: "K" } },
        typeAnnotation: { type: "TSStringKeyword" },
      };
      expect(serializeType(node)).toBe("{ [K]: string }");
    });

    it("should serialize rest type", () => {
      const node = {
        type: "TSRestType",
        typeAnnotation: { type: "TSStringKeyword" },
      };
      expect(serializeType(node)).toBe("...string");
    });

    it("should serialize optional type", () => {
      const node = {
        type: "TSOptionalType",
        typeAnnotation: { type: "TSStringKeyword" },
      };
      expect(serializeType(node)).toBe("string?");
    });

    it("should return unknown for unrecognized type", () => {
      const node = { type: "UnknownType" };
      expect(serializeType(node)).toBe("unknown");
    });
  });
});

describe("serializeValue", () => {
  describe("literals", () => {
    it("should serialize string literal", () => {
      expect(serializeValue({ type: "StringLiteral", value: "hello" })).toBe("hello");
    });

    it("should serialize number literal", () => {
      expect(serializeValue({ type: "NumericLiteral", value: 42 })).toBe("42");
    });

    it("should serialize boolean literal", () => {
      expect(serializeValue({ type: "BooleanLiteral", value: true })).toBe("true");
      expect(serializeValue({ type: "BooleanLiteral", value: false })).toBe("false");
    });

    it("should serialize null literal", () => {
      expect(serializeValue({ type: "NullLiteral" })).toBe("null");
    });

    it("should serialize generic Literal type", () => {
      expect(serializeValue({ type: "Literal", value: "test" })).toBe("test");
      expect(serializeValue({ type: "Literal", value: 123 })).toBe("123");
      expect(serializeValue({ type: "Literal", value: true })).toBe("true");
      expect(serializeValue({ type: "Literal", value: null })).toBe("null");
    });

    it("should serialize bigint literal", () => {
      expect(serializeValue({ type: "BigIntLiteral", value: 123 })).toBe("123n");
    });

    it("should serialize regex literal", () => {
      expect(serializeValue({ type: "RegExpLiteral", pattern: "\\d+", flags: "g" })).toBe(
        "/\\d+/g"
      );
    });
  });

  describe("identifiers", () => {
    it("should serialize identifier", () => {
      expect(serializeValue({ type: "Identifier", name: "myVar" })).toBe("myVar");
    });

    it("should serialize undefined keyword", () => {
      expect(serializeValue({ type: "UndefinedKeyword" })).toBe("undefined");
    });
  });

  describe("template literals", () => {
    it("should serialize simple template literal", () => {
      const node = {
        type: "TemplateLiteral",
        quasis: [{ value: { raw: "hello" } }],
        expressions: [],
      };
      expect(serializeValue(node)).toBe("`hello`");
    });

    it("should serialize template literal with expressions", () => {
      const node = {
        type: "TemplateLiteral",
        quasis: [{ value: { raw: "hello" } }],
        expressions: [{ type: "Identifier", name: "name" }],
      };
      expect(serializeValue(node)).toBe("`${...}`");
    });

    it("should handle empty template literal", () => {
      const node = {
        type: "TemplateLiteral",
        quasis: [],
      };
      expect(serializeValue(node)).toBe("``");
    });
  });

  describe("arrays", () => {
    it("should serialize empty array", () => {
      expect(serializeValue({ type: "ArrayExpression", elements: [] })).toBe("[]");
    });

    it("should serialize array with literals", () => {
      const node = {
        type: "ArrayExpression",
        elements: [
          { type: "NumericLiteral", value: 1 },
          { type: "NumericLiteral", value: 2 },
          { type: "NumericLiteral", value: 3 },
        ],
      };
      expect(serializeValue(node)).toBe("[1, 2, 3]");
    });

    it("should serialize array with mixed values", () => {
      const node = {
        type: "ArrayExpression",
        elements: [
          { type: "StringLiteral", value: "hello" },
          { type: "NumericLiteral", value: 42 },
          { type: "BooleanLiteral", value: true },
        ],
      };
      expect(serializeValue(node)).toBe("[hello, 42, true]");
    });

    it("should handle array with null elements", () => {
      const node = {
        type: "ArrayExpression",
        elements: [{ type: "NumericLiteral", value: 1 }, null, { type: "NumericLiteral", value: 3 }],
      };
      expect(serializeValue(node)).toBe("[1, 3]");
    });
  });

  describe("objects", () => {
    it("should serialize empty object", () => {
      expect(serializeValue({ type: "ObjectExpression", properties: [] })).toBe("{}");
    });

    it("should serialize object with properties", () => {
      const node = {
        type: "ObjectExpression",
        properties: [
          {
            type: "Property",
            key: { name: "name" },
            value: { type: "StringLiteral", value: "John" },
          },
          {
            type: "Property",
            key: { name: "age" },
            value: { type: "NumericLiteral", value: 30 },
          },
        ],
      };
      expect(serializeValue(node)).toBe("{ name: John, age: 30 }");
    });

    it("should handle ObjectProperty type", () => {
      const node = {
        type: "ObjectExpression",
        properties: [
          {
            type: "ObjectProperty",
            key: { name: "x" },
            value: { type: "NumericLiteral", value: 1 },
          },
        ],
      };
      expect(serializeValue(node)).toBe("{ x: 1 }");
    });

    it("should handle string literal keys", () => {
      const node = {
        type: "ObjectExpression",
        properties: [
          {
            type: "Property",
            key: { type: "StringLiteral", value: "my-key" },
            value: { type: "StringLiteral", value: "value" },
          },
        ],
      };
      expect(serializeValue(node)).toBe('{ "my-key": value }');
    });

    it("should filter out non-property types", () => {
      const node = {
        type: "ObjectExpression",
        properties: [
          {
            type: "Property",
            key: { name: "x" },
            value: { type: "NumericLiteral", value: 1 },
          },
          { type: "SpreadElement" }, // Should be filtered
        ],
      };
      expect(serializeValue(node)).toBe("{ x: 1 }");
    });
  });

  describe("functions", () => {
    it("should serialize arrow function", () => {
      expect(serializeValue({ type: "ArrowFunctionExpression" })).toBe("() => {}");
    });

    it("should serialize function expression", () => {
      expect(serializeValue({ type: "FunctionExpression" })).toBe("function() {}");
    });
  });

  describe("expressions", () => {
    it("should serialize binary expression", () => {
      const node = {
        type: "BinaryExpression",
        left: { type: "NumericLiteral", value: 1 },
        operator: "+",
        right: { type: "NumericLiteral", value: 2 },
      };
      expect(serializeValue(node)).toBe("1 + 2");
    });

    it("should serialize unary expression", () => {
      const node = {
        type: "UnaryExpression",
        operator: "!",
        argument: { type: "BooleanLiteral", value: true },
      };
      expect(serializeValue(node)).toBe("!true");
    });

    it("should serialize logical expression", () => {
      const node = {
        type: "LogicalExpression",
        left: { type: "Identifier", name: "a" },
        operator: "&&",
        right: { type: "Identifier", name: "b" },
      };
      expect(serializeValue(node)).toBe("a && b");
    });

    it("should serialize conditional expression", () => {
      const node = {
        type: "ConditionalExpression",
        test: { type: "Identifier", name: "x" },
        consequent: { type: "NumericLiteral", value: 1 },
        alternate: { type: "NumericLiteral", value: 2 },
      };
      expect(serializeValue(node)).toBe("x ? 1 : 2");
    });

    it("should serialize member expression", () => {
      const node = {
        type: "MemberExpression",
        object: { type: "Identifier", name: "obj" },
        property: { name: "prop" },
        computed: false,
      };
      expect(serializeValue(node)).toBe("obj.prop");
    });

    it("should serialize computed member expression", () => {
      const node = {
        type: "MemberExpression",
        object: { type: "Identifier", name: "obj" },
        property: { type: "StringLiteral", value: "key" },
        computed: true,
      };
      expect(serializeValue(node)).toBe("obj[key]");
    });

    it("should serialize call expression", () => {
      const node = {
        type: "CallExpression",
        callee: { type: "Identifier", name: "foo" },
        arguments: [
          { type: "NumericLiteral", value: 1 },
          { type: "StringLiteral", value: "hello" },
        ],
      };
      expect(serializeValue(node)).toBe("foo(1, hello)");
    });

    it("should serialize new expression", () => {
      const node = {
        type: "NewExpression",
        callee: { type: "Identifier", name: "Date" },
        arguments: [],
      };
      expect(serializeValue(node)).toBe("new Date()");
    });

    it("should serialize spread element", () => {
      const node = {
        type: "SpreadElement",
        argument: { type: "Identifier", name: "arr" },
      };
      expect(serializeValue(node)).toBe("...arr");
    });
  });

  describe("JSX", () => {
    it("should serialize JSX element", () => {
      expect(serializeValue({ type: "JSXElement" })).toBe("<jsx>");
    });

    it("should serialize JSX fragment", () => {
      expect(serializeValue({ type: "JSXFragment" })).toBe("<>");
    });
  });

  describe("edge cases", () => {
    it("should return empty string for null", () => {
      expect(serializeValue(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
      expect(serializeValue(undefined)).toBe("");
    });

    it("should return empty string for unknown type", () => {
      expect(serializeValue({ type: "UnknownType" })).toBe("");
    });
  });
});
