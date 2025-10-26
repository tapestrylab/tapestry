/**
 * Markdown renderer for templates
 */

import type { Block, Template, RenderContext, RenderResult } from './types';
import { interpolate, shouldRenderBlock, getByPath } from './interpolate';

/**
 * Render a template to Markdown
 */
export function renderMarkdown(
  template: Template,
  context: RenderContext
): RenderResult {
  const parts: string[] = [];

  for (const block of template.blocks) {
    // Check if block should be rendered
    if (!shouldRenderBlock(block.if, context.data)) {
      continue;
    }

    const rendered = renderBlock(block, context);
    if (rendered) {
      parts.push(rendered);
    }
  }

  return {
    content: parts.join('\n\n'),
    metadata: {
      title: context.data.name,
    },
  };
}

/**
 * Render a single block
 */
function renderBlock(block: Block, context: RenderContext): string {
  switch (block.type) {
    case 'heading':
      return renderHeading(block, context);
    case 'paragraph':
      return renderParagraph(block, context);
    case 'divider':
      return '---';
    case 'code':
      return renderCode(block, context);
    case 'codeBlocks':
      return renderCodeBlocks(block, context);
    case 'propsTable':
      return renderPropsTable(block, context);
    case 'callout':
      return renderCallout(block, context);
    case 'tabs':
      return renderTabs(block, context);
    case 'accordion':
      return renderAccordion(block, context);
    case 'usageSites':
      return renderUsageSites(block, context);
    case 'dependencyList':
      return renderDependencyList(block, context);
    case 'dependents':
      return renderDependents(block, context);
    case 'linkList':
      return renderLinkList(block, context);
    default:
      return '';
  }
}

/**
 * Render heading block
 */
function renderHeading(
  block: Extract<Block, { type: 'heading' }>,
  context: RenderContext
): string {
  const prefix = '#'.repeat(block.level);
  const text = interpolate(block.text, context.data);
  return `${prefix} ${text}`;
}

/**
 * Render paragraph block
 */
function renderParagraph(
  block: Extract<Block, { type: 'paragraph' }>,
  context: RenderContext
): string {
  return interpolate(block.text, context.data);
}

/**
 * Render code block
 */
function renderCode(
  block: Extract<Block, { type: 'code' }>,
  context: RenderContext
): string {
  const code = interpolate(block.code, context.data);
  const lang = block.language || '';
  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

/**
 * Render multiple code blocks from data source
 */
function renderCodeBlocks(
  block: Extract<Block, { type: 'codeBlocks' }>,
  context: RenderContext
): string {
  const items = getByPath(context.data, block.dataSource);
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  const lang = block.language || '';
  return items
    .map((item) => {
      const code = typeof item === 'string' ? item : JSON.stringify(item);
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    })
    .join('\n\n');
}

/**
 * Render props table
 */
function renderPropsTable(
  block: Extract<Block, { type: 'propsTable' }>,
  context: RenderContext
): string {
  const props = getByPath(context.data, block.dataSource);
  if (!Array.isArray(props) || props.length === 0) {
    return '';
  }

  const columns = block.columns || [
    { field: 'name', header: 'Prop' },
    { field: 'type', header: 'Type' },
    { field: 'required', header: 'Required' },
    { field: 'defaultValue', header: 'Default' },
    { field: 'description', header: 'Description' },
  ];

  // Build header
  const headerRow = `| ${columns.map((col) => col.header).join(' | ')} |`;
  const separatorRow = `| ${columns.map(() => '---').join(' | ')} |`;

  // Build rows
  const dataRows = props.map((prop: any) => {
    const cells = columns.map((col) => {
      const value = prop[col.field];
      if (value === undefined || value === null) {
        return '';
      }
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      // Escape pipe characters in cell content
      return String(value).replace(/\|/g, '\\|');
    });
    return `| ${cells.join(' | ')} |`;
  });

  return [headerRow, separatorRow, ...dataRows].join('\n');
}

/**
 * Render callout block
 */
function renderCallout(
  block: Extract<Block, { type: 'callout' }>,
  context: RenderContext
): string {
  const text = interpolate(block.text, context.data);
  const icon =
    {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅',
    }[block.variant] || 'ℹ️';

  return `> ${icon} **${block.variant.toUpperCase()}**\n> \n> ${text}`;
}

/**
 * Render tabs block (simplified for markdown)
 */
function renderTabs(
  block: Extract<Block, { type: 'tabs' }>,
  context: RenderContext
): string {
  const parts: string[] = [];

  for (const tab of block.tabs) {
    parts.push(`### ${tab.label}`);
    for (const content of tab.content) {
      if (shouldRenderBlock(content.if, context.data)) {
        const rendered = renderBlock(content, context);
        if (rendered) {
          parts.push(rendered);
        }
      }
    }
  }

  return parts.join('\n\n');
}

/**
 * Render accordion block (simplified for markdown)
 */
function renderAccordion(
  block: Extract<Block, { type: 'accordion' }>,
  context: RenderContext
): string {
  const parts: string[] = [];

  for (const item of block.items) {
    parts.push(`### ${item.title}`);
    for (const content of item.content) {
      if (shouldRenderBlock(content.if, context.data)) {
        const rendered = renderBlock(content, context);
        if (rendered) {
          parts.push(rendered);
        }
      }
    }
  }

  return parts.join('\n\n');
}

/**
 * Render usage sites
 */
function renderUsageSites(
  block: Extract<Block, { type: 'usageSites' }>,
  context: RenderContext
): string {
  const sites = getByPath(context.data, block.dataSource);
  if (!Array.isArray(sites) || sites.length === 0) {
    return '';
  }

  const items = sites.map((site: any) => {
    const location = `${site.file}:${site.line}${site.column ? `:${site.column}` : ''}`;
    if (site.context) {
      return `- **${location}**\n  \`\`\`tsx\n  ${site.context}\n  \`\`\``;
    }
    return `- ${location}`;
  });

  return items.join('\n');
}

/**
 * Render dependency list
 */
function renderDependencyList(
  block: Extract<Block, { type: 'dependencyList' }>,
  context: RenderContext
): string {
  const deps = getByPath(context.data, block.dataSource);
  if (!Array.isArray(deps) || deps.length === 0) {
    return '';
  }

  const items = deps.map((dep: any) => {
    const version = dep.version ? `@${dep.version}` : '';
    const type = dep.type ? ` (${dep.type})` : '';
    return `- \`${dep.name}${version}\`${type}`;
  });

  return items.join('\n');
}

/**
 * Render dependents
 */
function renderDependents(
  block: Extract<Block, { type: 'dependents' }>,
  context: RenderContext
): string {
  const dependents = getByPath(context.data, block.dataSource);
  if (!Array.isArray(dependents) || dependents.length === 0) {
    return '';
  }

  const items = dependents.map((dep: any) => {
    return `- **${dep.name}** (\`${dep.filePath}\`)`;
  });

  return items.join('\n');
}

/**
 * Render link list
 */
function renderLinkList(
  block: Extract<Block, { type: 'linkList' }>,
  context: RenderContext
): string {
  const links = getByPath(context.data, block.dataSource);
  if (!Array.isArray(links) || links.length === 0) {
    return '';
  }

  const items = links.map((link: string) => {
    return `- [${link}](${link})`;
  });

  return items.join('\n');
}
