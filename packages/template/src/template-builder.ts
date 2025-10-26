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

export interface TemplateBuilder {
  /**
   * Set template metadata
   */
  setMetadata(metadata: Partial<TemplateMetadata>): TemplateBuilder;

  /**
   * Add a heading block
   */
  addHeading(
    level: 1 | 2 | 3 | 4 | 5 | 6,
    text: string,
    options?: { id?: string; if?: string }
  ): TemplateBuilder;

  /**
   * Add a paragraph block
   */
  addParagraph(text: string, options?: { id?: string; if?: string }): TemplateBuilder;

  /**
   * Add a code block
   */
  addCode(
    code: string,
    language?: string,
    options?: { id?: string; if?: string }
  ): TemplateBuilder;

  /**
   * Add code blocks from a data source (array iteration)
   */
  addCodeBlocks(
    dataSource: string,
    options?: { language?: string; id?: string; if?: string }
  ): TemplateBuilder;

  /**
   * Add a divider block
   */
  addDivider(options?: { id?: string; if?: string }): TemplateBuilder;

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
  ): TemplateBuilder;

  /**
   * Add a callout block
   */
  addCallout(
    variant: 'info' | 'warning' | 'error' | 'success',
    text: string,
    options?: { id?: string; if?: string }
  ): TemplateBuilder;

  /**
   * Add a tabs block
   */
  addTabs(
    tabs: Array<{ label: string; content: Block[] }>,
    options?: { id?: string; if?: string }
  ): TemplateBuilder;

  /**
   * Add an accordion block
   */
  addAccordion(
    items: Array<{ title: string; content: Block[] }>,
    options?: { id?: string; if?: string }
  ): TemplateBuilder;

  /**
   * Add a usage sites block
   */
  addUsageSites(
    dataSource: string,
    options?: { id?: string; if?: string }
  ): TemplateBuilder;

  /**
   * Add a dependency list block
   */
  addDependencyList(
    dataSource: string,
    options?: { id?: string; if?: string }
  ): TemplateBuilder;

  /**
   * Add a dependents block
   */
  addDependents(
    dataSource: string,
    options?: { id?: string; if?: string }
  ): TemplateBuilder;

  /**
   * Add a link list block
   */
  addLinkList(
    dataSource: string,
    options?: { id?: string; if?: string }
  ): TemplateBuilder;

  /**
   * Find a block by ID
   */
  findBlock(id: string): Block | undefined;

  /**
   * Update a block by ID
   */
  updateBlock(id: string, updates: Partial<Block>): TemplateBuilder;

  /**
   * Remove a block by ID
   */
  removeBlock(id: string): TemplateBuilder;

  /**
   * Insert a block at a specific index
   */
  insertBlock(index: number, block: Block): TemplateBuilder;

  /**
   * Move a block from one index to another
   */
  moveBlock(fromIndex: number, toIndex: number): TemplateBuilder;

  /**
   * Get all blocks
   */
  getBlocks(): Block[];

  /**
   * Clone the builder
   */
  clone(): TemplateBuilder;

  /**
   * Convert to JSON
   */
  toJSON(): Template;

  /**
   * Save template to file
   */
  save(filePath: string): Promise<void>;
}

/**
 * Create a new template builder instance
 */
export const createTemplateBuilder = (template?: Partial<Template>): TemplateBuilder => {
  const state: Template = {
    name: template?.name || 'Untitled Template',
    version: template?.version,
    description: template?.description,
    outputFormat: template?.outputFormat || 'markdown',
    blocks: template?.blocks || [],
  };

  const builder: TemplateBuilder = {
    setMetadata(metadata: Partial<TemplateMetadata>): TemplateBuilder {
      if (metadata.name !== undefined) state.name = metadata.name;
      if (metadata.version !== undefined) state.version = metadata.version;
      if (metadata.description !== undefined)
        state.description = metadata.description;
      if (metadata.outputFormat !== undefined)
        state.outputFormat = metadata.outputFormat;
      return builder;
    },

    addHeading(
      level: 1 | 2 | 3 | 4 | 5 | 6,
      text: string,
      options?: { id?: string; if?: string }
    ): TemplateBuilder {
      const block: HeadingBlock = {
        type: 'heading',
        level,
        text,
        ...options,
      };
      state.blocks.push(block);
      return builder;
    },

    addParagraph(text: string, options?: { id?: string; if?: string }): TemplateBuilder {
      const block: ParagraphBlock = {
        type: 'paragraph',
        text,
        ...options,
      };
      state.blocks.push(block);
      return builder;
    },

    addCode(
      code: string,
      language?: string,
      options?: { id?: string; if?: string }
    ): TemplateBuilder {
      const block: CodeBlock = {
        type: 'code',
        code,
        language,
        ...options,
      };
      state.blocks.push(block);
      return builder;
    },

    addCodeBlocks(
      dataSource: string,
      options?: { language?: string; id?: string; if?: string }
    ): TemplateBuilder {
      const block = {
        type: 'codeBlocks' as const,
        dataSource,
        language: options?.language,
        id: options?.id,
        if: options?.if,
      };
      state.blocks.push(block);
      return builder;
    },

    addDivider(options?: { id?: string; if?: string }): TemplateBuilder {
      const block = {
        type: 'divider' as const,
        ...options,
      };
      state.blocks.push(block);
      return builder;
    },

    addPropsTable(
      dataSource: string,
      options?: {
        columns?: Array<{ field: string; header: string }>;
        id?: string;
        if?: string;
      }
    ): TemplateBuilder {
      const block: PropsTableBlock = {
        type: 'propsTable',
        dataSource,
        columns: options?.columns,
        id: options?.id,
        if: options?.if,
      };
      state.blocks.push(block);
      return builder;
    },

    addCallout(
      variant: 'info' | 'warning' | 'error' | 'success',
      text: string,
      options?: { id?: string; if?: string }
    ): TemplateBuilder {
      const block: CalloutBlock = {
        type: 'callout',
        variant,
        text,
        ...options,
      };
      state.blocks.push(block);
      return builder;
    },

    addTabs(
      tabs: Array<{ label: string; content: Block[] }>,
      options?: { id?: string; if?: string }
    ): TemplateBuilder {
      const block: TabsBlock = {
        type: 'tabs',
        tabs,
        ...options,
      };
      state.blocks.push(block);
      return builder;
    },

    addAccordion(
      items: Array<{ title: string; content: Block[] }>,
      options?: { id?: string; if?: string }
    ): TemplateBuilder {
      const block: AccordionBlock = {
        type: 'accordion',
        items,
        ...options,
      };
      state.blocks.push(block);
      return builder;
    },

    addUsageSites(
      dataSource: string,
      options?: { id?: string; if?: string }
    ): TemplateBuilder {
      const block = {
        type: 'usageSites' as const,
        dataSource,
        ...options,
      };
      state.blocks.push(block);
      return builder;
    },

    addDependencyList(
      dataSource: string,
      options?: { id?: string; if?: string }
    ): TemplateBuilder {
      const block = {
        type: 'dependencyList' as const,
        dataSource,
        ...options,
      };
      state.blocks.push(block);
      return builder;
    },

    addDependents(
      dataSource: string,
      options?: { id?: string; if?: string }
    ): TemplateBuilder {
      const block = {
        type: 'dependents' as const,
        dataSource,
        ...options,
      };
      state.blocks.push(block);
      return builder;
    },

    addLinkList(
      dataSource: string,
      options?: { id?: string; if?: string }
    ): TemplateBuilder {
      const block = {
        type: 'linkList' as const,
        dataSource,
        ...options,
      };
      state.blocks.push(block);
      return builder;
    },

    findBlock(id: string): Block | undefined {
      return state.blocks.find((block) => block.id === id);
    },

    updateBlock(id: string, updates: Partial<Block>): TemplateBuilder {
      const index = state.blocks.findIndex((block) => block.id === id);
      if (index !== -1) {
        state.blocks[index] = {
          ...state.blocks[index],
          ...updates,
        } as Block;
      }
      return builder;
    },

    removeBlock(id: string): TemplateBuilder {
      state.blocks = state.blocks.filter((block) => block.id !== id);
      return builder;
    },

    insertBlock(index: number, block: Block): TemplateBuilder {
      state.blocks.splice(index, 0, block);
      return builder;
    },

    moveBlock(fromIndex: number, toIndex: number): TemplateBuilder {
      const [block] = state.blocks.splice(fromIndex, 1);
      state.blocks.splice(toIndex, 0, block);
      return builder;
    },

    getBlocks(): Block[] {
      return state.blocks;
    },

    clone(): TemplateBuilder {
      return createTemplateBuilder(JSON.parse(JSON.stringify(state)));
    },

    toJSON(): Template {
      return JSON.parse(JSON.stringify(state));
    },

    async save(filePath: string): Promise<void> {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(
        filePath,
        JSON.stringify(state, null, 2),
        'utf-8'
      );
    },
  };

  return builder;
};

/**
 * Load template from file
 */
export const loadTemplate = async (filePath: string): Promise<TemplateBuilder> => {
  const content = await fs.readFile(filePath, 'utf-8');
  const template = JSON.parse(content) as Template;
  return createTemplateBuilder(template);
};

/**
 * Factory function to create a new template builder
 */
export const createTemplate = (name: string): TemplateBuilder => {
  return createTemplateBuilder({ name });
};
