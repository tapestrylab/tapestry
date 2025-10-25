/**
 * SSRRenderer interface
 */
export interface SSRRenderer {
  render(component: any, props?: Record<string, any>): Promise<string>;
  renderMany(components: Array<{ component: any; props?: Record<string, any> }>): Promise<string[]>;
}

/**
 * SSRRenderer configuration
 */
export interface SSRRendererConfig {
  renderFunction?: (component: any, props?: any) => string;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

/**
 * Wrap rendered HTML in a container div
 */
function wrapInContainer(html: string): string {
  return `<div class="tapestry-preview">${html}</div>`;
}

/**
 * Create placeholder HTML when SSR is not available
 */
function createPlaceholderHtml(
  component: any,
  props?: Record<string, any>
): string {
  const componentName = component?.name || component?.displayName || "Component";
  const propsStr = props ? JSON.stringify(props, null, 2) : "{}";

  return `
    <div class="tapestry-preview tapestry-preview--placeholder">
      <div class="tapestry-preview__header">
        <strong>${componentName}</strong>
      </div>
      <div class="tapestry-preview__body">
        <p>SSR preview not available. Install React and react-dom to enable server-side rendering.</p>
        <details>
          <summary>Component Props</summary>
          <pre><code>${escapeHtml(propsStr)}</code></pre>
        </details>
      </div>
    </div>
  `.trim();
}

/**
 * Create error HTML when rendering fails
 */
function createErrorHtml(error: any): string {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : "";

  return `
    <div class="tapestry-preview tapestry-preview--error">
      <div class="tapestry-preview__header">
        <strong>Render Error</strong>
      </div>
      <div class="tapestry-preview__body">
        <p class="tapestry-preview__error-message">${escapeHtml(message)}</p>
        ${
          stack
            ? `<details>
            <summary>Stack Trace</summary>
            <pre><code>${escapeHtml(stack)}</code></pre>
          </details>`
            : ""
        }
      </div>
    </div>
  `.trim();
}

/**
 * Render using React's renderToString
 */
async function renderWithReact(
  component: any,
  props?: Record<string, any>
): Promise<string | null> {
  try {
    // Dynamic import to avoid hard dependency on React
    const React = await import("react");
    const ReactDOMServer = await import("react-dom/server");

    // Create element and render to string
    const element = React.createElement(component, props);
    const html = ReactDOMServer.renderToString(element);

    return wrapInContainer(html);
  } catch (error) {
    // React or react-dom not installed
    return null;
  }
}

/**
 * Create an SSR renderer that handles server-side rendering of components to HTML
 */
export function createSSRRenderer(config: SSRRendererConfig = {}): SSRRenderer {
  const custom_render_function = config.renderFunction;

  /**
   * Render a component to HTML string
   * @param component - The component to render (React component, Vue component, etc.)
   * @param props - Props to pass to the component
   * @returns HTML string
   */
  async function render(component: any, props?: Record<string, any>): Promise<string> {
    // Use custom render function if provided
    if (custom_render_function) {
      try {
        return custom_render_function(component, props);
      } catch (error) {
        console.error("Custom render function failed:", error);
        return createErrorHtml(error);
      }
    }

    // Try to use React SSR if available
    try {
      const html = await renderWithReact(component, props);
      if (html) return html;
    } catch (error) {
      console.warn("React SSR not available, using fallback:", error);
    }

    // Fallback: Return placeholder HTML
    return createPlaceholderHtml(component, props);
  }

  /**
   * Render multiple components in parallel
   */
  async function renderMany(
    components: Array<{ component: any; props?: Record<string, any> }>
  ): Promise<string[]> {
    return Promise.all(
      components.map(({ component, props }) => render(component, props))
    );
  }

  return {
    render,
    renderMany,
  };
}
