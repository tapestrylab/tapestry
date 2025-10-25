import { describe, it, expect } from "vitest";
import { SandboxConfigGenerator } from "./SandboxConfigGenerator.js";
import type { LoadedComponent } from "./ComponentLoader.js";

describe("SandboxConfigGenerator", () => {
  const generator = new SandboxConfigGenerator();

  it("should generate sandbox config from loaded component", () => {
    const component: LoadedComponent = {
      filePath: "/src/components/Button.tsx",
      source: `
import React from 'react';

export function Button({ children }: { children: React.ReactNode }) {
  return <button>{children}</button>;
}
      `,
      imports: [{ specifier: "react", resolvedPath: "https://esm.sh/react" }],
    };

    const config = generator.generate(component);

    expect(config.code).toBe(component.source);
    expect(config.dependencies).toHaveProperty("react");
    expect(config.files).toHaveProperty("Button.tsx");
    expect(config.files).toHaveProperty("App.tsx");
    expect(config.files).toHaveProperty("index.html");
    expect(config.template).toBe("react-ts");
  });

  it("should extract npm dependencies from imports", () => {
    const component: LoadedComponent = {
      filePath: "/src/Component.tsx",
      source: "",
      imports: [
        { specifier: "react", resolvedPath: null },
        { specifier: "react-dom", resolvedPath: null },
        { specifier: "@radix-ui/react-popover", resolvedPath: null },
        { specifier: "lodash/debounce", resolvedPath: null },
        { specifier: "./Button", resolvedPath: null }, // Should skip
        { specifier: "../utils", resolvedPath: null }, // Should skip
      ],
    };

    const config = generator.generate(component);

    expect(config.dependencies).toHaveProperty("react");
    expect(config.dependencies).toHaveProperty("react-dom");
    expect(config.dependencies).toHaveProperty("@radix-ui/react-popover");
    expect(config.dependencies).toHaveProperty("lodash");
    expect(config.dependencies).not.toHaveProperty("./Button");
    expect(config.dependencies).not.toHaveProperty("../utils");
  });

  it("should use additional dependencies if provided", () => {
    const component: LoadedComponent = {
      filePath: "/src/Component.tsx",
      source: "",
      imports: [{ specifier: "react", resolvedPath: null }],
    };

    const config = generator.generate(component, {
      additionalDependencies: {
        "react": "18.3.1",
        "styled-components": "^6.0.0",
      },
    });

    expect(config.dependencies?.["react"]).toBe("18.3.1");
    expect(config.dependencies).toHaveProperty("styled-components");
  });

  it("should generate default example code", () => {
    const component: LoadedComponent = {
      filePath: "/src/Button.tsx",
      source: `
export function Button({ children }) {
  return <button>{children}</button>;
}
      `,
      imports: [],
    };

    const config = generator.generate(component);

    expect(config.files?.["App.tsx"]).toContain("import React from 'react'");
    expect(config.files?.["App.tsx"]).toContain("import { Button }");
    expect(config.files?.["App.tsx"]).toContain("from './Button'");
    expect(config.files?.["App.tsx"]).toContain("<Button />");
  });

  it("should use custom example code if provided", () => {
    const component: LoadedComponent = {
      filePath: "/src/Button.tsx",
      source: "export function Button() {}",
      imports: [],
    };

    const customExample = `
import { Button } from './Button';
export default function App() {
  return <Button variant="primary">Click me</Button>;
}
    `;

    const config = generator.generate(component, {
      exampleCode: customExample,
    });

    expect(config.files?.["App.tsx"]).toBe(customExample);
  });

  it("should infer template from imports", () => {
    const reactComponent: LoadedComponent = {
      filePath: "/src/Component.tsx",
      source: "import React from 'react';",
      imports: [{ specifier: "react", resolvedPath: null }],
    };

    const vueComponent: LoadedComponent = {
      filePath: "/src/Component.vue",
      source: "import { ref } from 'vue';",
      imports: [{ specifier: "vue", resolvedPath: null }],
    };

    const svelteComponent: LoadedComponent = {
      filePath: "/src/Component.svelte",
      source: "import { writable } from 'svelte';",
      imports: [{ specifier: "svelte", resolvedPath: null }],
    };

    expect(generator.generate(reactComponent).template).toBe("react-ts");
    expect(generator.generate(vueComponent).template).toBe("vue-ts");
    expect(generator.generate(svelteComponent).template).toBe("svelte");
  });

  it("should use custom template if provided", () => {
    const component: LoadedComponent = {
      filePath: "/src/Component.tsx",
      source: "",
      imports: [],
    };

    const config = generator.generate(component, {
      template: "custom-template",
    });

    expect(config.template).toBe("custom-template");
  });

  it("should generate index.html", () => {
    const component: LoadedComponent = {
      filePath: "/src/Component.tsx",
      source: "",
      imports: [],
    };

    const config = generator.generate(component);

    expect(config.files?.["index.html"]).toContain("<!DOCTYPE html>");
    expect(config.files?.["index.html"]).toContain('<div id="root"></div>');
  });

  it("should handle scoped package names correctly", () => {
    const component: LoadedComponent = {
      filePath: "/src/Component.tsx",
      source: "",
      imports: [
        {
          specifier: "@radix-ui/react-popover/dist/index.js",
          resolvedPath: null,
        },
        { specifier: "@radix-ui/react-dialog", resolvedPath: null },
      ],
    };

    const config = generator.generate(component);

    expect(config.dependencies).toHaveProperty("@radix-ui/react-popover");
    expect(config.dependencies).toHaveProperty("@radix-ui/react-dialog");
  });

  it("should generate configs for multiple components", () => {
    const components: LoadedComponent[] = [
      {
        filePath: "/src/Button.tsx",
        source: "export function Button() {}",
        imports: [],
      },
      {
        filePath: "/src/Input.tsx",
        source: "export function Input() {}",
        imports: [],
      },
    ];

    const configs = generator.generateMany(components);

    expect(configs).toHaveLength(2);
    expect(configs[0].files).toHaveProperty("Button.tsx");
    expect(configs[1].files).toHaveProperty("Input.tsx");
  });
});
