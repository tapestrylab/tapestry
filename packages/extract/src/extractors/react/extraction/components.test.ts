import { describe, it, expect } from "vitest";
import { parseSync } from "oxc-parser";
import { extractComponents } from "./components.js";

describe("extractComponents", () => {
  const filePath = "/test/Component.tsx";

  const parseCode = (code: string) => {
    const result = parseSync(filePath, code, {
      sourceType: "module",
    });
    return result.program;
  };

  describe("function declaration components", () => {
    it("should extract function declaration component", () => {
      const code = `
        function Button() {
          return <button>Click me</button>;
        }
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(1);
      expect(components[0]).toMatchObject({
        type: "component",
        name: "Button",
        filePath,
        exportType: "named",
        props: [],
      });
    });

    it("should extract function component with props", () => {
      const code = `
        function Button({ label, onClick }: { label: string; onClick: () => void }) {
          return <button onClick={onClick}>{label}</button>;
        }
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(1);
      expect(components[0].name).toBe("Button");
      expect(components[0].props).toHaveLength(2);
      expect(components[0].props).toEqual([
        { name: "label", type: "string", required: true, examples: ['<Button label="Click me" />'] },
        { name: "onClick", type: "() => void", required: true, examples: ["<Button onClick={() => void} />"] },
      ]);
    });

    it("should skip non-React functions (no JSX return)", () => {
      const code = `
        function calculateSum(a, b) {
          return a + b;
        }
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(0);
    });

    it("should skip lowercase function names", () => {
      const code = `
        function button() {
          return <button>Click me</button>;
        }
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(0);
    });
  });

  describe("arrow function components", () => {
    it("should extract arrow function component", () => {
      const code = `
        const Card = () => {
          return <div>Card content</div>;
        };
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(1);
      expect(components[0]).toMatchObject({
        type: "component",
        name: "Card",
        filePath,
        exportType: "named",
        props: [],
      });
    });

    it("should extract arrow function with props", () => {
      const code = `
        const Card = ({ title, subtitle }: { title: string; subtitle?: string }) => {
          return <div><h1>{title}</h1><p>{subtitle}</p></div>;
        };
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(1);
      expect(components[0].name).toBe("Card");
      expect(components[0].props).toEqual([
        { name: "title", type: "string", required: true, examples: ['<Card title="Click me" />'] },
        { name: "subtitle", type: "string", required: false, examples: ['<Card subtitle="Click me" />'] },
      ]);
    });

    it("should extract arrow function with implicit return", () => {
      const code = `
        const Icon = () => <svg><path /></svg>;
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(1);
      expect(components[0].name).toBe("Icon");
    });

    it("should skip arrow functions without JSX", () => {
      const code = `
        const add = (a, b) => a + b;
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(0);
    });
  });

  describe("named exports", () => {
    it("should extract named exported function", () => {
      const code = `
        export function Alert() {
          return <div>Alert</div>;
        }
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(1);
      expect(components[0]).toMatchObject({
        name: "Alert",
        exportType: "named",
      });
    });

    it("should extract named exported arrow function", () => {
      const code = `
        export const Badge = () => <span>Badge</span>;
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(1);
      expect(components[0]).toMatchObject({
        name: "Badge",
        exportType: "named",
      });
    });

    it("should extract multiple named exports", () => {
      const code = `
        export function Button() {
          return <button>Click</button>;
        }

        export const Card = () => <div>Card</div>;
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(2);
      expect(components[0].name).toBe("Button");
      expect(components[1].name).toBe("Card");
      expect(components[0].exportType).toBe("named");
      expect(components[1].exportType).toBe("named");
    });
  });

  describe("default exports", () => {
    it("should extract default exported arrow function", () => {
      const code = `
        export default () => <div>Default component</div>;
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(1);
      expect(components[0]).toMatchObject({
        name: "default",
        exportType: "default",
        props: [],
      });
    });

    it("should mark component as default when identifier is exported", () => {
      const code = `
        function App() {
          return <div>App</div>;
        }
        export default App;
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(1);
      expect(components[0]).toMatchObject({
        name: "App",
        exportType: "default",
      });
    });
  });

  describe("props with default values", () => {
    it("should extract props with default values from function", () => {
      const code = `
        function Button({
          label = "Click me",
          variant = "primary"
        }: {
          label?: string;
          variant?: string;
        }) {
          return <button>{label}</button>;
        }
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(1);
      expect(components[0].props).toEqual([
        { name: "label", type: "string", required: false, defaultValue: "Click me", examples: ['<Button label="Click me" />'] },
        { name: "variant", type: "string", required: false, defaultValue: "primary", examples: ['<Button variant="primary" />'] },
      ]);
    });

    it("should extract props with default values from arrow function", () => {
      const code = `
        const Counter = ({
          initialCount = 0,
          step = 1
        }: {
          initialCount?: number;
          step?: number;
        }) => <div>{initialCount}</div>;
      `;
      const program = parseCode(code);
      const components = extractComponents(program, filePath, code);

      expect(components).toHaveLength(1);
      expect(components[0].props).toEqual([
        { name: "initialCount", type: "number", required: false, defaultValue: "0", examples: ["<Counter initialCount={0} />"] },
        { name: "step", type: "number", required: false, defaultValue: "1", examples: ["<Counter step={1} />"] },
      ]);
    });
  });
});
