/**
 * Template commands - delegates to @tapestrylab/template
 */

import { Command } from 'commander';
import { generateAll, generate } from '@tapestrylab/template';
import type { Template } from '@tapestrylab/template';
import pc from 'picocolors';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate command
 */
export function createGenerateCommand(): Command {
  const command = new Command('generate');

  command
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
        console.log(pc.blue('🎨 Tapestry Template Generator\n'));

        const sourcePath = path.resolve(options.source);
        const outputPath = path.resolve(options.output);

        // Check if source exists
        try {
          await fs.access(sourcePath);
        } catch {
          console.error(pc.red(`Error: Source path does not exist: ${sourcePath}`));
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
          console.error(pc.red('Error: No template specified. Use --template <name|path>'));
          process.exit(1);
        }

        // Load theme if specified
        const theme = options.theme ? path.resolve(options.theme) : undefined;

        console.log(pc.gray(`Source:   ${sourcePath}`));
        console.log(pc.gray(`Output:   ${outputPath}`));
        console.log(pc.gray(`Format:   ${options.format}`));
        console.log(pc.gray(`Template: ${options.template}`));
        if (theme) {
          console.log(pc.gray(`Theme:    ${theme}`));
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

          console.log(pc.green(`✓ Generated ${results.size} documentation file(s)`));
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

          console.log(pc.green(`✓ Generated ${outputFile}`));
        }
      } catch (error) {
        console.error(pc.red('\nError:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return command;
}

/**
 * List command
 */
export function createListCommand(): Command {
  const command = new Command('list');

  command.description('List available built-in templates').action(async () => {
    try {
      console.log(pc.blue('📋 Built-in Templates\n'));

      // Find the template package's templates directory
      const templatesDir = path.join(__dirname, '../../../template/templates');

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
        console.log(pc.cyan(`• ${name}`));
        if (template.description) {
          console.log(pc.gray(`  ${template.description}`));
        }
        console.log(pc.gray(`  Format: ${template.outputFormat || 'markdown'}`));
        console.log(pc.gray(`  Blocks: ${template.blocks.length}`));
        console.log();
      }

      console.log(pc.gray('Usage: tapestry generate --template <name>'));
    } catch (error) {
      console.error(pc.red('Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

  return command;
}

/**
 * Init command
 */
export function createInitCommand(): Command {
  const command = new Command('init');

  command
    .description('Initialize Tapestry configuration in current directory')
    .option('--force', 'Overwrite existing files')
    .action(async (options) => {
      try {
        console.log(pc.blue('🎨 Initializing Tapestry Template\n'));

        const cwd = process.cwd();

        // Create tapestry.config.js
        const configPath = path.join(cwd, 'tapestry.config.js');
        const configExists = await fileExists(configPath);

        if (configExists && !options.force) {
          console.log(pc.yellow('⚠ tapestry.config.js already exists (use --force to overwrite)'));
        } else {
          await fs.writeFile(configPath, CONFIG_TEMPLATE);
          console.log(pc.green('✓ Created tapestry.config.js'));
        }

        // Create templates directory
        const templatesDir = path.join(cwd, 'templates');
        await fs.mkdir(templatesDir, { recursive: true });
        console.log(pc.green('✓ Created templates/ directory'));

        // Create example custom template
        const exampleTemplatePath = path.join(templatesDir, 'custom.taptpl.json');
        const exampleExists = await fileExists(exampleTemplatePath);

        if (exampleExists && !options.force) {
          console.log(
            pc.yellow('⚠ templates/custom.taptpl.json already exists (use --force to overwrite)')
          );
        } else {
          await fs.writeFile(exampleTemplatePath, EXAMPLE_TEMPLATE);
          console.log(pc.green('✓ Created templates/custom.taptpl.json'));
        }

        // Create example theme
        const themePath = path.join(cwd, 'custom.theme.js');
        const themeExists = await fileExists(themePath);

        if (themeExists && !options.force) {
          console.log(pc.yellow('⚠ custom.theme.js already exists (use --force to overwrite)'));
        } else {
          await fs.writeFile(themePath, THEME_TEMPLATE);
          console.log(pc.green('✓ Created custom.theme.js'));
        }

        console.log(pc.blue('\n📖 Next steps:'));
        console.log(pc.gray('1. Edit tapestry.config.js to configure your documentation generation'));
        console.log(pc.gray('2. Customize templates/custom.taptpl.json for your needs'));
        console.log(pc.gray('3. Run: tapestry generate'));
      } catch (error) {
        console.error(pc.red('Error:'), error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return command;
}

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
  const builtInPath = path.join(__dirname, '../../../template/templates', `${templateOption}.taptpl.json`);
  try {
    const content = await fs.readFile(builtInPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    throw new Error(
      `Built-in template '${templateOption}' not found. Use 'tapestry list' to see available templates.`
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
