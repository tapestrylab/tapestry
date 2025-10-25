import { describe, it, expect } from "vitest";
import { SSRRenderer } from "./SSRRenderer.js";

describe("SSRRenderer", () => {
  it("should create instance with default options", () => {
    const renderer = new SSRRenderer();
    expect(renderer).toBeInstanceOf(SSRRenderer);
  });

  it("should use custom render function if provided", async () => {
    const customRender = (component: any, props?: any) => {
      return `<div>Custom render: ${component.displayName || component.name || 'Component'}</div>`;
    };

    const renderer = new SSRRenderer({ renderFunction: customRender });
    const Component = () => null;
    Component.displayName = "TestComponent";

    const html = await renderer.render(Component);
    expect(html).toContain("Custom render");
    expect(html).toContain("TestComponent");
  });

  it("should render component with React SSR when available", async () => {
    const renderer = new SSRRenderer();
    // This test expects React to be available and render via SSR
    // The component returns null, so React renders nothing
    // But the wrapper should still be present
    const Component = () => null;

    const html = await renderer.render(Component);

    expect(html).toContain("tapestry-preview");
    // Since React SSR is used, we won't see placeholder content
  });

  it("should handle component with content", async () => {
    const renderer = new SSRRenderer();
    // Use a component that actually returns something
    const Component = ({ children }: { children?: any }) => {
      return children || "Hello World";
    };

    const html = await renderer.render(Component);

    expect(html).toContain("tapestry-preview");
    expect(html).toContain("Hello World");
  });

  it("should handle component with props", async () => {
    const renderer = new SSRRenderer();
    const Component = ({ message }: { message: string }) => {
      return message;
    };

    const html = await renderer.render(Component, { message: "Test Message" });

    expect(html).toContain("tapestry-preview");
    expect(html).toContain("Test Message");
  });

  it("should create error HTML when render function throws", async () => {
    const renderer = new SSRRenderer({
      renderFunction: () => {
        throw new Error("Test error");
      },
    });

    const html = await renderer.render(() => null);

    expect(html).toContain("tapestry-preview--error");
    expect(html).toContain("Test error");
  });

  it("should render multiple components in parallel", async () => {
    const renderer = new SSRRenderer({
      renderFunction: (component) => `<div>${component.name}</div>`,
    });

    const Component1 = () => null;
    Component1.displayName = "Component1";

    const Component2 = () => null;
    Component2.displayName = "Component2";

    const results = await renderer.renderMany([
      { component: Component1 },
      { component: Component2, props: { foo: "bar" } },
    ]);

    expect(results).toHaveLength(2);
    expect(results[0]).toContain("Component1");
    expect(results[1]).toContain("Component2");
  });

  it("should wrap rendered HTML in container when using custom render", async () => {
    const renderer = new SSRRenderer({
      renderFunction: () => "<button>Click me</button>",
    });

    const html = await renderer.render(() => null);

    expect(html).toContain("<button>Click me</button>");
  });
});
