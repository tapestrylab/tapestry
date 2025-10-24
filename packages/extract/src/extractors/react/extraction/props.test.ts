import { describe, it, expect } from "vitest";
import { extractPropsFromParams } from "./props.js";

describe("extractPropsFromParams", () => {
  describe("empty/invalid params", () => {
    it("should return empty array for no params", () => {
      expect(extractPropsFromParams([])).toEqual({ props: [] });
    });

    it("should return empty array for null params", () => {
      expect(extractPropsFromParams(null as any)).toEqual({ props: [] });
    });

    it("should return empty array for undefined params", () => {
      expect(extractPropsFromParams(undefined as any)).toEqual({ props: [] });
    });

    it("should return empty array when first param is null", () => {
      expect(extractPropsFromParams([null])).toEqual({ props: [] });
    });
  });

  describe("ObjectPattern with TSTypeLiteral", () => {
    it("should extract props from destructured pattern with type annotation", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "name" },
              value: { type: "Identifier", name: "name" },
            },
            {
              type: "Property",
              key: { name: "age" },
              value: { type: "Identifier", name: "age" },
            },
          ],
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "name" },
                  typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
                  optional: false,
                },
                {
                  type: "TSPropertySignature",
                  key: { name: "age" },
                  typeAnnotation: { typeAnnotation: { type: "TSNumberKeyword" } },
                  optional: false,
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "name", type: "string", required: true, examples: ["John Doe"] },
        { name: "age", type: "number", required: true, examples: ["42"] },
      ] });
    });

    it("should handle optional props", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "title" },
              value: { type: "Identifier", name: "title" },
            },
          ],
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "title" },
                  typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
                  optional: true,
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "title", type: "string", required: false, examples: ["Click me"] },
      ] });
    });

    it("should handle props with default values", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "count" },
              value: {
                type: "AssignmentPattern",
                right: { type: "NumericLiteral", value: 0 },
              },
            },
          ],
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "count" },
                  typeAnnotation: { typeAnnotation: { type: "TSNumberKeyword" } },
                  optional: false,
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "count", type: "number", required: false, defaultValue: "0", examples: ["0"] },
      ] });
    });

    it("should handle optional props with default values", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "label" },
              value: {
                type: "AssignmentPattern",
                right: { type: "StringLiteral", value: "Default" },
              },
            },
          ],
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "label" },
                  typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
                  optional: true,
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "label", type: "string", required: false, defaultValue: "Default", examples: ["Default"] },
      ] });
    });

    it("should handle mixed props", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "required" },
              value: { type: "Identifier", name: "required" },
            },
            {
              type: "Property",
              key: { name: "optional" },
              value: { type: "Identifier", name: "optional" },
            },
            {
              type: "Property",
              key: { name: "withDefault" },
              value: {
                type: "AssignmentPattern",
                right: { type: "BooleanLiteral", value: true },
              },
            },
          ],
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "required" },
                  typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
                  optional: false,
                },
                {
                  type: "TSPropertySignature",
                  key: { name: "optional" },
                  typeAnnotation: { typeAnnotation: { type: "TSNumberKeyword" } },
                  optional: true,
                },
                {
                  type: "TSPropertySignature",
                  key: { name: "withDefault" },
                  typeAnnotation: { typeAnnotation: { type: "TSBooleanKeyword" } },
                  optional: false,
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "required", type: "string", required: true, examples: ["Example value"] },
        { name: "optional", type: "number", required: false, examples: ["42"] },
        { name: "withDefault", type: "boolean", required: false, defaultValue: "true", examples: ["true", "false"] },
      ] });
    });

    it("should filter out non-Property types", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "name" },
              value: { type: "Identifier", name: "name" },
            },
            {
              type: "RestElement", // Should be filtered
              key: { name: "rest" },
            },
          ],
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "name" },
                  typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "name", type: "string", required: true, examples: ["John Doe"] },
      ] });
    });

    it("should handle props not in type map", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "extra" },
              value: { type: "Identifier", name: "extra" },
            },
          ],
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "extra", type: "any", required: true },
      ] });
    });
  });

  describe("ObjectPattern without TSTypeLiteral", () => {
    it("should extract props from plain destructured pattern", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "x" },
              value: {
                type: "Identifier",
                name: "x",
                typeAnnotation: { typeAnnotation: { type: "TSNumberKeyword" } },
              },
            },
          ],
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "x", type: "number", required: true, examples: ["42"] },
      ] });
    });

    it("should handle props without type annotation", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "value" },
              value: { type: "Identifier", name: "value" },
            },
          ],
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "value", type: "any", required: true },
      ] });
    });

    it("should handle props with default values", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "enabled" },
              value: {
                type: "AssignmentPattern",
                right: { type: "BooleanLiteral", value: false },
                typeAnnotation: { typeAnnotation: { type: "TSBooleanKeyword" } },
              },
            },
          ],
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "enabled", type: "boolean", required: false, defaultValue: "false", examples: ["false", "true"] },
      ] });
    });

    it("should handle optional props", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "optional" },
              value: {
                type: "Identifier",
                name: "optional",
                optional: true,
                typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
              },
            },
          ],
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "optional", type: "string", required: false, examples: ["Example value"] },
      ] });
    });
  });

  describe("Identifier with type annotation", () => {
    it("should extract props from TSTypeLiteral", () => {
      const params = [
        {
          type: "Identifier",
          name: "props",
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "title" },
                  typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
                  optional: false,
                },
                {
                  type: "TSPropertySignature",
                  key: { name: "count" },
                  typeAnnotation: { typeAnnotation: { type: "TSNumberKeyword" } },
                  optional: true,
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "title", type: "string", required: true, examples: ["Click me"] },
        { name: "count", type: "number", required: false, examples: ["42"] },
      ] });
    });

    it("should return empty array for TSTypeReference", () => {
      const params = [
        {
          type: "Identifier",
          name: "props",
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeReference",
              typeName: { name: "ButtonProps" },
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [] });
    });

    it("should filter out non-TSPropertySignature members", () => {
      const params = [
        {
          type: "Identifier",
          name: "props",
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "name" },
                  typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
                },
                {
                  type: "TSCallSignature", // Should be filtered
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "name", type: "string", required: true, examples: ["John Doe"] },
      ] });
    });

    it("should handle members without key names", () => {
      const params = [
        {
          type: "Identifier",
          name: "props",
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "valid" },
                  typeAnnotation: { typeAnnotation: { type: "TSStringKeyword" } },
                },
                {
                  type: "TSPropertySignature",
                  key: {}, // Missing name
                  typeAnnotation: { typeAnnotation: { type: "TSNumberKeyword" } },
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "valid", type: "string", required: true, examples: ["user-123"] },
      ] });
    });
  });

  describe("Identifier without type annotation", () => {
    it("should return empty array", () => {
      const params = [
        {
          type: "Identifier",
          name: "props",
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [] });
    });
  });

  describe("other param types", () => {
    it("should return empty array for unsupported param type", () => {
      const params = [
        {
          type: "ArrayPattern",
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [] });
    });
  });

  describe("complex types", () => {
    it("should serialize complex prop types", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "items" },
              value: { type: "Identifier", name: "items" },
            },
          ],
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "items" },
                  typeAnnotation: {
                    typeAnnotation: {
                      type: "TSArrayType",
                      elementType: { type: "TSStringKeyword" },
                    },
                  },
                  optional: false,
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "items", type: "string[]", required: true },
      ] });
    });

    it("should serialize union types", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "variant" },
              value: { type: "Identifier", name: "variant" },
            },
          ],
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "variant" },
                  typeAnnotation: {
                    typeAnnotation: {
                      type: "TSUnionType",
                      types: [
                        {
                          type: "TSLiteralType",
                          literal: { type: "StringLiteral", value: "primary" },
                        },
                        {
                          type: "TSLiteralType",
                          literal: { type: "StringLiteral", value: "secondary" },
                        },
                      ],
                    },
                  },
                  optional: false,
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        { name: "variant", type: "primary | secondary", required: true, examples: ["primary", "secondary"] },
      ] });
    });

    it("should handle complex default values", () => {
      const params = [
        {
          type: "ObjectPattern",
          properties: [
            {
              type: "Property",
              key: { name: "config" },
              value: {
                type: "AssignmentPattern",
                right: {
                  type: "ObjectExpression",
                  properties: [
                    {
                      type: "Property",
                      key: { name: "enabled" },
                      value: { type: "BooleanLiteral", value: true },
                    },
                  ],
                },
              },
            },
          ],
          typeAnnotation: {
            typeAnnotation: {
              type: "TSTypeLiteral",
              members: [
                {
                  type: "TSPropertySignature",
                  key: { name: "config" },
                  typeAnnotation: {
                    typeAnnotation: {
                      type: "TSTypeLiteral",
                      members: [
                        {
                          type: "TSPropertySignature",
                          key: { name: "enabled" },
                          typeAnnotation: { typeAnnotation: { type: "TSBooleanKeyword" } },
                        },
                      ],
                    },
                  },
                  optional: false,
                },
              ],
            },
          },
        },
      ];

      expect(extractPropsFromParams(params)).toEqual({ props: [
        {
          name: "config",
          type: "{ enabled: boolean }",
          required: false,
          defaultValue: "{ enabled: true }",
          examples: ["{ enabled: true }"],
        },
      ] });
    });
  });
});
