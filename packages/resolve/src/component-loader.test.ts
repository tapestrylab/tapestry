import { describe, it, expect, beforeEach } from "vitest";
import { createComponentLoader, type ComponentLoader } from "./component-loader.js";
import { createResolver } from "./resolver.js";
import { local } from "./strategies/local.js";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const TEST_DIR = join(process.cwd(), "test-component-loader");

describe("createComponentLoader", () => {
  let loader: ComponentLoader;

  beforeEach(() => {
    // Clean up and create test directory
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}

    mkdirSync(TEST_DIR, { recursive: true });

    // Create a resolver with local strategy
    const resolver = createResolver({
      strategies: [
        local({
          root: TEST_DIR,
          alias: {
            "@ui": "components",
          },
        }),
      ],
    });

    loader = createComponentLoader(resolver);
  });

  it("should load a component file and extract source", async () => {
    const componentPath = join(TEST_DIR, "Button.tsx");
    const componentSource = `
import React from 'react';

export function Button({ children }: { children: React.ReactNode }) {
  return <button>{children}</button>;
}
`;

    writeFileSync(componentPath, componentSource);

    const loaded = await loader.load(componentPath);

    expect(loaded.filePath).toContain("Button.tsx");
    expect(loaded.source).toBe(componentSource);
    expect(loaded.imports).toContainEqual(
      expect.objectContaining({ specifier: "react" })
    );
  });

  it("should extract imports from source code", async () => {
    const componentPath = join(TEST_DIR, "Component.tsx");
    const componentSource = `
import React from 'react';
import { useState } from 'react';
import * as ReactDOM from 'react-dom';
import Button from './Button';
import '@styles/global.css';

const something = require('lodash');
`;

    writeFileSync(componentPath, componentSource);

    const loaded = await loader.load(componentPath);

    expect(loaded.imports).toContainEqual(
      expect.objectContaining({ specifier: "react" })
    );
    expect(loaded.imports).toContainEqual(
      expect.objectContaining({ specifier: "react-dom" })
    );
    expect(loaded.imports).toContainEqual(
      expect.objectContaining({ specifier: "./Button" })
    );
    expect(loaded.imports).toContainEqual(
      expect.objectContaining({ specifier: "@styles/global.css" })
    );
    expect(loaded.imports).toContainEqual(
      expect.objectContaining({ specifier: "lodash" })
    );
  });

  it("should resolve import paths", async () => {
    const componentPath = join(TEST_DIR, "components", "Button.tsx");
    mkdirSync(join(TEST_DIR, "components"), { recursive: true });

    const componentSource = `
import React from 'react';
import './styles.css';
`;

    writeFileSync(componentPath, componentSource);

    const loaded = await loader.load(componentPath);

    // React should not be resolved (no local file)
    const reactImport = loaded.imports.find((imp) => imp.specifier === "react");
    expect(reactImport?.resolvedPath).toBeNull();

    // Relative import should attempt resolution
    const stylesImport = loaded.imports.find(
      (imp) => imp.specifier === "./styles.css"
    );
    expect(stylesImport).toBeDefined();
  });

  it("should deduplicate imports", async () => {
    const componentPath = join(TEST_DIR, "Component.tsx");
    const componentSource = `
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
`;

    writeFileSync(componentPath, componentSource);

    const loaded = await loader.load(componentPath);

    const reactImports = loaded.imports.filter(
      (imp) => imp.specifier === "react"
    );
    expect(reactImports).toHaveLength(1);
  });

  it("should handle dynamic imports", async () => {
    const componentPath = join(TEST_DIR, "Dynamic.tsx");
    const componentSource = `
export async function loadComponent() {
  const module = await import('./LazyComponent');
  return module.default;
}
`;

    writeFileSync(componentPath, componentSource);

    const loaded = await loader.load(componentPath);

    expect(loaded.imports).toContainEqual(
      expect.objectContaining({ specifier: "./LazyComponent" })
    );
  });

  it("should load multiple components in parallel", async () => {
    const button = join(TEST_DIR, "Button.tsx");
    const input = join(TEST_DIR, "Input.tsx");

    writeFileSync(button, "export function Button() {}");
    writeFileSync(input, "export function Input() {}");

    const loaded = await loader.loadMany([button, input]);

    expect(loaded).toHaveLength(2);
    expect(loaded[0].filePath).toContain("Button.tsx");
    expect(loaded[1].filePath).toContain("Input.tsx");
  });
});
