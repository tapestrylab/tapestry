/**
 * MDX renderer for templates
 */

import type { Block, Template, RenderContext, RenderResult } from './types';
import { interpolate, shouldRenderBlock, getByPath } from './interpolate';
import { renderMarkdown } from './renderer-markdown';

/**
 * Render a template to MDX
 */
export function renderMDX(
  template: Template,
  context: RenderContext
): RenderResult {
  // Get component imports needed for this template
  const imports = collectComponentImports(template);

  // Generate frontmatter
  const frontmatter = generateFrontmatter(context);

  // Render blocks
  const parts: string[] = [];

  for (const block of template.blocks) {
    if (!shouldRenderBlock(block.if, context.data)) {
      continue;
    }

    const rendered = renderBlockMDX(block, context);
    if (rendered) {
      parts.push(rendered);
    }
  }

  // Combine frontmatter, imports, and content
  const content = [
    frontmatter,
    imports.length > 0 ? imports.join('\n') : '',
    '',
    parts.join('\n\n'),
  ]
    .filter(Boolean)
    .join('\n');

  return {
    content,
    metadata: {
      title: context.data.name,
    },
  };
}

/**
 * Generate frontmatter for MDX
 */
function generateFrontmatter(context: RenderContext): string {
  const { data } = context;

  const frontmatter: Record<string, any> = {
    title: data.name,
  };

  if (data.description) {
    frontmatter.description = data.description;
  }

  const lines = Object.entries(frontmatter).map(
    ([key, value]) => `${key}: ${JSON.stringify(value)}`
  );

  return `---\n${lines.join('\n')}\n---`;
}

/**
 * Collect component imports needed for template
 */
function collectComponentImports(template: Template): string[] {
  const imports = new Set<string>();

  function collectFromBlocks(blocks: Block[]) {
    for (const block of blocks) {
      // Collect imports based on block type
      switch (block.type) {
        case 'propsTable':
          imports.add(
            "import { PropsTable } from '@tapestrylab/template/components';"
          );
          break;
        case 'tabs':
          imports.add(
            "import { Tabs } from '@tapestrylab/template/components';"
          );
          // Recursively collect from tab content
          if ('tabs' in block) {
            for (const tab of block.tabs) {
              collectFromBlocks(tab.content);
            }
          }
          break;
        case 'accordion':
          imports.add(
            "import { Accordion } from '@tapestrylab/template/components';"
          );
          // Recursively collect from accordion content
          if ('items' in block) {
            for (const item of block.items) {
              collectFromBlocks(item.content);
            }
          }
          break;
        case 'callout':
          imports.add(
            "import { Callout } from '@tapestrylab/template/components';"
          );
          break;
        case 'code':
        case 'codeBlocks':
          imports.add(
            "import { CodeBlock } from '@tapestrylab/template/components';"
          );
          break;
      }
    }
  }

  collectFromBlocks(template.blocks);

  return Array.from(imports);
}

/**
 * Render a single block as MDX
 */
function renderBlockMDX(block: Block, context: RenderContext): string {
  // For most blocks, use markdown renderer
  // Override for interactive components that need JSX
  switch (block.type) {
    case 'propsTable':
      return renderPropsTableMDX(block, context);
    case 'tabs':
      return renderTabsMDX(block, context);
    case 'accordion':
      return renderAccordionMDX(block, context);
    case 'callout':
      return renderCalloutMDX(block, context);
    default:
      // Fall back to markdown rendering for simple blocks
      return renderBlockMarkdown(block, context);
  }
}

/**
 * Render props table as MDX component
 */
function renderPropsTableMDX(
  block: Extract<Block, { type: 'propsTable' }>,
  context: RenderContext
): string {
  const props = getByPath(context.data, block.dataSource);
  if (!Array.isArray(props) || props.length === 0) {
    return '';
  }

  const propsData = JSON.stringify(props, null, 2);
  return `<PropsTable data={${propsData}} />`;
}

/**
 * Render tabs as MDX component
 */
function renderTabsMDX(
  block: Extract<Block, { type: 'tabs' }>,
  context: RenderContext
): string {
  const tabs = block.tabs.map((tab) => {
    const content = tab.content
      .filter((c) => shouldRenderBlock(c.if, context.data))
      .map((c) => renderBlockMDX(c, context))
      .join('\n\n');

    return {
      label: tab.label,
      content,
    };
  });

  const tabsData = JSON.stringify(tabs, null, 2);
  return `<Tabs tabs={${tabsData}} />`;
}

/**
 * Render accordion as MDX component
 */
function renderAccordionMDX(
  block: Extract<Block, { type: 'accordion' }>,
  context: RenderContext
): string {
  const items = block.items.map((item) => {
    const content = item.content
      .filter((c) => shouldRenderBlock(c.if, context.data))
      .map((c) => renderBlockMDX(c, context))
      .join('\n\n');

    return {
      title: item.title,
      content,
    };
  });

  const itemsData = JSON.stringify(items, null, 2);
  return `<Accordion items={${itemsData}} />`;
}

/**
 * Render callout as MDX component
 */
function renderCalloutMDX(
  block: Extract<Block, { type: 'callout' }>,
  context: RenderContext
): string {
  const text = interpolate(block.text, context.data);
  return `<Callout variant="${block.variant}">\n  ${text}\n</Callout>`;
}

/**
 * Render block as markdown (fallback)
 */
function renderBlockMarkdown(block: Block, context: RenderContext): string {
  // Create a mini template with just this block
  const miniTemplate: Template = {
    name: 'temp',
    blocks: [block],
  };

  const result = renderMarkdown(miniTemplate, context);
  return result.content;
}
