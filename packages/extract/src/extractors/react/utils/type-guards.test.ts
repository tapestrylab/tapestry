import { describe, it, expect } from "vitest";
import {
  isReactComponent,
  isArrowOrFunction,
  isJSXNode,
  hasJSXReturn,
  hasJSXInBlock,
  hasJSXInExpression,
} from "./type-guards.js";

describe("type-guards", () => {
  describe("isJSXNode", () => {
    it("should return true for JSXElement", () => {
      expect(isJSXNode({ type: "JSXElement" })).toBe(true);
    });

    it("should return true for JSXFragment", () => {
      expect(isJSXNode({ type: "JSXFragment" })).toBe(true);
    });

    it("should return false for non-JSX nodes", () => {
      expect(isJSXNode({ type: "Identifier" })).toBe(false);
      expect(isJSXNode({ type: "BinaryExpression" })).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(isJSXNode(null)).toBe(false);
      expect(isJSXNode(undefined)).toBe(false);
    });
  });

  describe("isArrowOrFunction", () => {
    it("should return true for ArrowFunctionExpression", () => {
      expect(isArrowOrFunction({ type: "ArrowFunctionExpression" })).toBe(true);
    });

    it("should return true for FunctionExpression", () => {
      expect(isArrowOrFunction({ type: "FunctionExpression" })).toBe(true);
    });

    it("should return false for other node types", () => {
      expect(isArrowOrFunction({ type: "FunctionDeclaration" })).toBe(false);
      expect(isArrowOrFunction({ type: "Identifier" })).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(isArrowOrFunction(null)).toBe(false);
      expect(isArrowOrFunction(undefined)).toBe(false);
    });
  });

  describe("hasJSXInExpression", () => {
    it("should return true for JSX nodes", () => {
      expect(hasJSXInExpression({ type: "JSXElement" })).toBe(true);
      expect(hasJSXInExpression({ type: "JSXFragment" })).toBe(true);
    });

    it("should return true for conditional with JSX in consequent", () => {
      const node = {
        type: "ConditionalExpression",
        consequent: { type: "JSXElement" },
        alternate: { type: "Identifier" },
      };
      expect(hasJSXInExpression(node)).toBe(true);
    });

    it("should return true for conditional with JSX in alternate", () => {
      const node = {
        type: "ConditionalExpression",
        consequent: { type: "Identifier" },
        alternate: { type: "JSXElement" },
      };
      expect(hasJSXInExpression(node)).toBe(true);
    });

    it("should return true for logical expression with JSX in left", () => {
      const node = {
        type: "LogicalExpression",
        left: { type: "JSXElement" },
        right: { type: "Identifier" },
      };
      expect(hasJSXInExpression(node)).toBe(true);
    });

    it("should return true for logical expression with JSX in right", () => {
      const node = {
        type: "LogicalExpression",
        left: { type: "Identifier" },
        right: { type: "JSXElement" },
      };
      expect(hasJSXInExpression(node)).toBe(true);
    });

    it("should return true for parenthesized JSX", () => {
      const node = {
        type: "ParenthesizedExpression",
        expression: { type: "JSXElement" },
      };
      expect(hasJSXInExpression(node)).toBe(true);
    });

    it("should handle nested expressions", () => {
      const node = {
        type: "ConditionalExpression",
        consequent: {
          type: "LogicalExpression",
          left: { type: "Identifier" },
          right: { type: "JSXElement" },
        },
        alternate: { type: "Identifier" },
      };
      expect(hasJSXInExpression(node)).toBe(true);
    });

    it("should return false for non-JSX expressions", () => {
      expect(hasJSXInExpression({ type: "Identifier" })).toBe(false);
      expect(hasJSXInExpression({ type: "BinaryExpression" })).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(hasJSXInExpression(null)).toBe(false);
      expect(hasJSXInExpression(undefined)).toBe(false);
    });
  });

  describe("hasJSXInBlock", () => {
    it("should return true for block with JSX return statement", () => {
      const block = {
        type: "BlockStatement",
        body: [
          {
            type: "ReturnStatement",
            argument: { type: "JSXElement" },
          },
        ],
      };
      expect(hasJSXInBlock(block)).toBe(true);
    });

    it("should return true for block with conditional JSX return", () => {
      const block = {
        type: "BlockStatement",
        body: [
          {
            type: "ReturnStatement",
            argument: {
              type: "ConditionalExpression",
              consequent: { type: "JSXElement" },
              alternate: { type: "JSXFragment" },
            },
          },
        ],
      };
      expect(hasJSXInBlock(block)).toBe(true);
    });

    it("should return false for block without return", () => {
      const block = {
        type: "BlockStatement",
        body: [
          { type: "ExpressionStatement" },
        ],
      };
      expect(hasJSXInBlock(block)).toBe(false);
    });

    it("should return false for block with non-JSX return", () => {
      const block = {
        type: "BlockStatement",
        body: [
          {
            type: "ReturnStatement",
            argument: { type: "Identifier" },
          },
        ],
      };
      expect(hasJSXInBlock(block)).toBe(false);
    });

    it("should return false for non-block nodes", () => {
      expect(hasJSXInBlock({ type: "Identifier" })).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(hasJSXInBlock(null)).toBe(false);
      expect(hasJSXInBlock(undefined)).toBe(false);
    });
  });

  describe("hasJSXReturn", () => {
    it("should return true for arrow function with JSX expression", () => {
      const node = {
        type: "ArrowFunctionExpression",
        expression: true,
        body: { type: "JSXElement" },
      };
      expect(hasJSXReturn(node)).toBe(true);
    });

    it("should return true for arrow function with JSX fragment expression", () => {
      const node = {
        type: "ArrowFunctionExpression",
        expression: true,
        body: { type: "JSXFragment" },
      };
      expect(hasJSXReturn(node)).toBe(true);
    });

    it("should return true for function with JSX return in block", () => {
      const node = {
        type: "FunctionExpression",
        body: {
          type: "BlockStatement",
          body: [
            {
              type: "ReturnStatement",
              argument: { type: "JSXElement" },
            },
          ],
        },
      };
      expect(hasJSXReturn(node)).toBe(true);
    });

    it("should return false for arrow function with non-JSX expression", () => {
      const node = {
        type: "ArrowFunctionExpression",
        expression: true,
        body: { type: "Identifier" },
      };
      expect(hasJSXReturn(node)).toBe(false);
    });

    it("should return false for function with non-JSX return", () => {
      const node = {
        type: "FunctionExpression",
        body: {
          type: "BlockStatement",
          body: [
            {
              type: "ReturnStatement",
              argument: { type: "Identifier" },
            },
          ],
        },
      };
      expect(hasJSXReturn(node)).toBe(false);
    });

    it("should return false for null/undefined", () => {
      expect(hasJSXReturn(null)).toBe(false);
      expect(hasJSXReturn(undefined)).toBe(false);
    });
  });

  describe("isReactComponent", () => {
    it("should return true for PascalCase name with JSX return", () => {
      const node = {
        type: "ArrowFunctionExpression",
        expression: true,
        body: { type: "JSXElement" },
      };
      expect(isReactComponent("Button", node)).toBe(true);
      expect(isReactComponent("MyComponent", node)).toBe(true);
    });

    it("should return false for lowercase name", () => {
      const node = {
        type: "ArrowFunctionExpression",
        expression: true,
        body: { type: "JSXElement" },
      };
      expect(isReactComponent("button", node)).toBe(false);
      expect(isReactComponent("myComponent", node)).toBe(false);
    });

    it("should return false for undefined name", () => {
      const node = {
        type: "ArrowFunctionExpression",
        expression: true,
        body: { type: "JSXElement" },
      };
      expect(isReactComponent(undefined, node)).toBe(false);
    });

    it("should return false for PascalCase name without JSX return", () => {
      const node = {
        type: "ArrowFunctionExpression",
        expression: true,
        body: { type: "Identifier" },
      };
      expect(isReactComponent("Button", node)).toBe(false);
    });

    it("should return false for empty name", () => {
      const node = {
        type: "ArrowFunctionExpression",
        expression: true,
        body: { type: "JSXElement" },
      };
      expect(isReactComponent("", node)).toBe(false);
    });
  });
});
