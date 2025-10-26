#!/usr/bin/env node

/**
 * CLI for @tapestrylab/template
 *
 * Provides command-line interface for generating component documentation
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAll, generate } from './generator.js';
import type { Template } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

// Get package version
const packageJson = JSON.parse(
  await fs.readFile(path.join(__dirname, '../package.json'), 'utf-8')
);

program
  .name('tapestry-template')
  .description('Generate component documentation from templates')
  .version(packageJson.version);

/**
 * Generate command - main documentation generation
 */
program
  .command('generate')
  .description('Generate documentation from component source files')
  .option('-s, --source <path>', 'Source file or directory', './src/components')
  .option('-o, --output <path>', 'Output directory', './docs')
  .option('-t, --template <name|path>', 'Template name or path to template file')
  .option('-f, --format <format>', 'Output format (markdown|mdx|html)', 'mdx')
  .option('--theme <path>', 'Path to custom theme file')
  .option('--no-relationships', 'Skip relationship resolution')
  .option('--project-root <path>', 'Project root for relationship resolution')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🎨 Tapestry Template Generator\n'));

      const sourcePath = path.resolve(options.source);
      const outputPath = path.resolve(options.output);

      // Check if source exists
      try {
        await fs.access(sourcePath);
      } catch {
        console.error(chalk.red(`Error: Source path does not exist: ${sourcePath}`));
        process.exit(1);
      }

      // Determine if source is a file or directory
      const stat = await fs.stat(sourcePath);
      const isDirectory = stat.isDirectory();

      // Load template
      let template: Template | undefined;
      if (options.template) {
        template = await loadTemplateOption(options.template);
      }

      if (!template) {
        console.error(
          chalk.red('Error: No template specified. Use --template <name|path>')
        );
        process.exit(1);
      }

      // Load theme if specified
      const theme = options.theme ? path.resolve(options.theme) : undefined;

      console.log(chalk.gray(`Source:   ${sourcePath}`));
      console.log(chalk.gray(`Output:   ${outputPath}`));
      console.log(chalk.gray(`Format:   ${options.format}`));
      console.log(chalk.gray(`Template: ${options.template}`));
      if (theme) {
        console.log(chalk.gray(`Theme:    ${theme}`));
      }
      console.log();

      if (isDirectory) {
        // Batch generation
        const results = await generateAll({
          source: sourcePath,
          outputDir: outputPath,
          template,
          theme,
          outputFormat: options.format,
          includeRelationships: options.relationships,
          projectRoot: options.projectRoot,
        });

        console.log(
          chalk.green(`✓ Generated ${results.size} documentation file(s)`)
        );
      } else {
        // Single file generation
        const componentName = path.basename(sourcePath, path.extname(sourcePath));
        const ext = options.format === 'mdx' ? '.mdx' : '.md';
        const outputFile = path.join(outputPath, `${componentName}${ext}`);

        await generate({
          source: sourcePath,
          template,
          theme,
          output: outputFile,
          outputFormat: options.format,
          includeRelationships: options.relationships,
          projectRoot: options.projectRoot,
        });

        console.log(chalk.green(`✓ Generated ${outputFile}`));
      }
    } catch (error) {
      console.error(chalk.red('\nError:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

/**
 * List command - show available built-in templates
 */
program
  .command('list')
  .description('List available built-in templates')
  .action(async () => {
    try {
      console.log(chalk.blue('📋 Built-in Templates\n'));

      const templatesDir = path.join(__dirname, '../templates');
      const templateFiles = await fs.readdir(templatesDir);

      const templates = await Promise.all(
        templateFiles
          .filter((file) => file.endsWith('.taptpl.json'))
          .map(async (file) => {
            const templatePath = path.join(templatesDir, file);
            const content = await fs.readFile(templatePath, 'utf-8');
            const template: Template = JSON.parse(content);
            const name = path.basename(file, '.taptpl.json');
            return { name, template };
          })
      );

      for (const { name, template } of templates) {
        console.log(chalk.cyan(`• ${name}`));
        if (template.description) {
          console.log(chalk.gray(`  ${template.description}`));
        }
        console.log(chalk.gray(`  Format: ${template.outputFormat || 'markdown'}`));
        console.log(chalk.gray(`  Blocks: ${template.blocks.length}`));
        console.log();
      }

      console.log(chalk.gray('Usage: tapestry-template generate --template <name>'));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

/**
 * Init command - scaffold configuration files
 */
program
  .command('init')
  .description('Initialize Tapestry configuration in current directory')
  .option('--force', 'Overwrite existing files')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🎨 Initializing Tapestry Template\n'));

      const cwd = process.cwd();

      // Create tapestry.config.js
      const configPath = path.join(cwd, 'tapestry.config.js');
      const configExists = await fileExists(configPath);

      if (configExists && !options.force) {
        console.log(chalk.yellow('⚠ tapestry.config.js already exists (use --force to overwrite)'));
      } else {
        await fs.writeFile(configPath, CONFIG_TEMPLATE);
        console.log(chalk.green('✓ Created tapestry.config.js'));
      }

      // Create templates directory
      const templatesDir = path.join(cwd, 'templates');
      await fs.mkdir(templatesDir, { recursive: true });
      console.log(chalk.green('✓ Created templates/ directory'));

      // Create example custom template
      const exampleTemplatePath = path.join(templatesDir, 'custom.taptpl.json');
      const exampleExists = await fileExists(exampleTemplatePath);

      if (exampleExists && !options.force) {
        console.log(
          chalk.yellow('⚠ templates/custom.taptpl.json already exists (use --force to overwrite)')
        );
      } else {
        await fs.writeFile(exampleTemplatePath, EXAMPLE_TEMPLATE);
        console.log(chalk.green('✓ Created templates/custom.taptpl.json'));
      }

      // Create example theme
      const themePath = path.join(cwd, 'custom.theme.js');
      const themeExists = await fileExists(themePath);

      if (themeExists && !options.force) {
        console.log(chalk.yellow('⚠ custom.theme.js already exists (use --force to overwrite)'));
      } else {
        await fs.writeFile(themePath, THEME_TEMPLATE);
        console.log(chalk.green('✓ Created custom.theme.js'));
      }

      console.log(chalk.blue('\n📖 Next steps:'));
      console.log(chalk.gray('1. Edit tapestry.config.js to configure your documentation generation'));
      console.log(chalk.gray('2. Customize templates/custom.taptpl.json for your needs'));
      console.log(chalk.gray('3. Run: tapestry-template generate'));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

/**
 * Helper: Load template from name or path
 */
async function loadTemplateOption(templateOption: string): Promise<Template | undefined> {
  // Check if it's a path to a file
  if (templateOption.includes('/') || templateOption.includes('\\')) {
    const templatePath = path.resolve(templateOption);
    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      throw new Error(`Template file not found: ${templatePath}`);
    }
  }

  // Try to load from built-in templates
  const builtInPath = path.join(__dirname, '../templates', `${templateOption}.taptpl.json`);
  try {
    const content = await fs.readFile(builtInPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    throw new Error(
      `Built-in template '${templateOption}' not found. Use 'tapestry-template list' to see available templates.`
    );
  }
}

/**
 * Helper: Check if file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Template: tapestry.config.js
 */
const CONFIG_TEMPLATE = `/**
 * Tapestry Template Configuration
 *
 * This file configures documentation generation for your components.
 */

export default {
  // Source directory containing components
  source: './src/components',

  // Output directory for generated documentation
  output: './docs',

  // Template to use (built-in name or path to custom template)
  // Built-in templates: component-docs, minimal, api-reference
  template: 'component-docs',

  // Output format: 'markdown' | 'mdx' | 'html'
  outputFormat: 'mdx',

  // Optional: Custom theme
  // theme: './custom.theme.js',

  // Include component relationships (dependencies, usage sites)
  includeRelationships: true,

  // Project root for relationship resolution
  projectRoot: '.',
};
`;

/**
 * Template: Example custom template
 */
const EXAMPLE_TEMPLATE = `{
  "name": "custom",
  "description": "Custom component documentation template",
  "version": "1.0.0",
  "outputFormat": "mdx",
  "blocks": [
    {
      "type": "heading",
      "level": 1,
      "text": "{{name}}"
    },
    {
      "type": "paragraph",
      "text": "{{description}}",
      "if": "description"
    },
    {
      "type": "divider"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Props"
    },
    {
      "type": "propsTable",
      "propsPath": "props"
    },
    {
      "type": "heading",
      "level": 2,
      "text": "Usage",
      "if": "examples.length > 0"
    },
    {
      "type": "codeBlocks",
      "examples": "examples",
      "if": "examples.length > 0"
    }
  ]
}
`;

/**
 * Template: Example custom theme
 */
const THEME_TEMPLATE = `/**
 * Custom Tapestry Theme
 *
 * Customize the appearance of generated documentation components.
 */

export default {
  components: {
    propsTable: {
      styles: {
        table: 'border-collapse border border-gray-300 w-full',
        header: 'bg-gray-100 font-bold p-2',
        row: 'hover:bg-gray-50',
        cell: 'border border-gray-300 p-2',
      },
    },
    callout: {
      styles: {
        warning: 'bg-yellow-50 border-l-4 border-yellow-400 p-4',
        info: 'bg-blue-50 border-l-4 border-blue-400 p-4',
        error: 'bg-red-50 border-l-4 border-red-400 p-4',
      },
    },
    codeBlock: {
      styles: {
        container: 'bg-gray-900 text-gray-100 p-4 rounded',
      },
    },
  },
  global: {
    fontFamily: 'Inter, system-ui, sans-serif',
    accentColor: '#3b82f6',
  },
};
`;
