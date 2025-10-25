/**
 * Template Builder API for programmatic template creation and modification
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type {
  Template,
  Block,
  TemplateMetadata,
  HeadingBlock,
  ParagraphBlock,
  CodeBlock,
  PropsTableBlock,
  CalloutBlock,
  TabsBlock,
  AccordionBlock,
} from './types';

export class TemplateBuilder {
  private template: Template;

  constructor(template?: Partial<Template>) {
    this.template = {
      name: template?.name || 'Untitled Template',
      version: template?.version,
      description: template?.description,
      outputFormat: template?.outputFormat || 'markdown',
      blocks: template?.blocks || [],
    };
  }

  /**
   * Set template metadata
   */
  setMetadata(metadata: Partial<TemplateMetadata>): this {
    if (metadata.name !== undefined) this.template.name = metadata.name;
    if (metadata.version !== undefined) this.template.version = metadata.version;
    if (metadata.description !== undefined)
      this.template.description = metadata.description;
    if (metadata.outputFormat !== undefined)
      this.template.outputFormat = metadata.outputFormat;
    return this;
  }

  /**
   * Add a heading block
   */
  addHeading(
    level: 1 | 2 | 3 | 4 | 5 | 6,
    text: string,
    options?: { id?: string; if?: string }
  ): this {
    const block: HeadingBlock = {
      type: 'heading',
      level,
      text,
      ...options,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add a paragraph block
   */
  addParagraph(text: string, options?: { id?: string; if?: string }): this {
    const block: ParagraphBlock = {
      type: 'paragraph',
      text,
      ...options,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add a code block
   */
  addCode(
    code: string,
    language?: string,
    options?: { id?: string; if?: string }
  ): this {
    const block: CodeBlock = {
      type: 'code',
      code,
      language,
      ...options,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add code blocks from a data source (array iteration)
   */
  addCodeBlocks(
    dataSource: string,
    options?: { language?: string; id?: string; if?: string }
  ): this {
    const block = {
      type: 'codeBlocks' as const,
      dataSource,
      language: options?.language,
      id: options?.id,
      if: options?.if,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add a divider block
   */
  addDivider(options?: { id?: string; if?: string }): this {
    const block = {
      type: 'divider' as const,
      ...options,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add a props table block
   */
  addPropsTable(
    dataSource: string,
    options?: {
      columns?: Array<{ field: string; header: string }>;
      id?: string;
      if?: string;
    }
  ): this {
    const block: PropsTableBlock = {
      type: 'propsTable',
      dataSource,
      columns: options?.columns,
      id: options?.id,
      if: options?.if,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add a callout block
   */
  addCallout(
    variant: 'info' | 'warning' | 'error' | 'success',
    text: string,
    options?: { id?: string; if?: string }
  ): this {
    const block: CalloutBlock = {
      type: 'callout',
      variant,
      text,
      ...options,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add a tabs block
   */
  addTabs(
    tabs: Array<{ label: string; content: Block[] }>,
    options?: { id?: string; if?: string }
  ): this {
    const block: TabsBlock = {
      type: 'tabs',
      tabs,
      ...options,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add an accordion block
   */
  addAccordion(
    items: Array<{ title: string; content: Block[] }>,
    options?: { id?: string; if?: string }
  ): this {
    const block: AccordionBlock = {
      type: 'accordion',
      items,
      ...options,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add a usage sites block
   */
  addUsageSites(
    dataSource: string,
    options?: { id?: string; if?: string }
  ): this {
    const block = {
      type: 'usageSites' as const,
      dataSource,
      ...options,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add a dependency list block
   */
  addDependencyList(
    dataSource: string,
    options?: { id?: string; if?: string }
  ): this {
    const block = {
      type: 'dependencyList' as const,
      dataSource,
      ...options,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add a dependents block
   */
  addDependents(
    dataSource: string,
    options?: { id?: string; if?: string }
  ): this {
    const block = {
      type: 'dependents' as const,
      dataSource,
      ...options,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Add a link list block
   */
  addLinkList(
    dataSource: string,
    options?: { id?: string; if?: string }
  ): this {
    const block = {
      type: 'linkList' as const,
      dataSource,
      ...options,
    };
    this.template.blocks.push(block);
    return this;
  }

  /**
   * Find a block by ID
   */
  findBlock(id: string): Block | undefined {
    return this.template.blocks.find((block) => block.id === id);
  }

  /**
   * Update a block by ID
   */
  updateBlock(id: string, updates: Partial<Block>): this {
    const index = this.template.blocks.findIndex((block) => block.id === id);
    if (index !== -1) {
      this.template.blocks[index] = {
        ...this.template.blocks[index],
        ...updates,
      } as Block;
    }
    return this;
  }

  /**
   * Remove a block by ID
   */
  removeBlock(id: string): this {
    this.template.blocks = this.template.blocks.filter(
      (block) => block.id !== id
    );
    return this;
  }

  /**
   * Insert a block at a specific index
   */
  insertBlock(index: number, block: Block): this {
    this.template.blocks.splice(index, 0, block);
    return this;
  }

  /**
   * Move a block from one index to another
   */
  moveBlock(fromIndex: number, toIndex: number): this {
    const [block] = this.template.blocks.splice(fromIndex, 1);
    this.template.blocks.splice(toIndex, 0, block);
    return this;
  }

  /**
   * Get all blocks
   */
  getBlocks(): Block[] {
    return this.template.blocks;
  }

  /**
   * Clone the builder
   */
  clone(): TemplateBuilder {
    return new TemplateBuilder(JSON.parse(JSON.stringify(this.template)));
  }

  /**
   * Convert to JSON
   */
  toJSON(): Template {
    return JSON.parse(JSON.stringify(this.template));
  }

  /**
   * Load template from file
   */
  static async load(filePath: string): Promise<TemplateBuilder> {
    const content = await fs.readFile(filePath, 'utf-8');
    const template = JSON.parse(content) as Template;
    return new TemplateBuilder(template);
  }

  /**
   * Save template to file
   */
  async save(filePath: string): Promise<void> {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      filePath,
      JSON.stringify(this.template, null, 2),
      'utf-8'
    );
  }
}

/**
 * Factory function to create a new template builder
 */
export function createTemplate(name: string): TemplateBuilder {
  return new TemplateBuilder({ name });
}
