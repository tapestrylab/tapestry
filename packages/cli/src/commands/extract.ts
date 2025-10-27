/**
 * Extract command - delegates to @tapestrylab/extract
 */

import { Command } from 'commander';
import { extract, loadConfig } from '@tapestrylab/extract';
import pc from 'picocolors';
import { writeFile } from 'node:fs/promises';

export function createExtractCommand(): Command {
  const command = new Command('extract');

  command
    .description('Extract metadata from source files')
    .option('-c, --config <path>', 'Path to config file')
    .option('-r, --root <path>', 'Project root directory')
    .option('-o, --output <path>', 'Output file path')
    .option('-i, --include <patterns...>', 'Include patterns')
    .option('-e, --exclude <patterns...>', 'Exclude patterns')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        console.log(pc.blue('🧵 Tapestry Extract'));
        console.log();

        // Load config
        const config = await loadConfig(options.config, {
          root: options.root,
          include: options.include,
          exclude: options.exclude,
          output: options.output,
        });

        console.log(pc.gray(`Root: ${config.root}`));
        console.log(pc.gray(`Include: ${config.include.join(', ')}`));
        console.log();

        // Run extraction
        const result = await extract(config);

        // Display results
        console.log(pc.green('✓ Extraction complete'));
        console.log();
        console.log(pc.bold('Stats:'));
        console.log(`  Files scanned: ${result.stats.filesScanned}`);
        console.log(`  Files processed: ${result.stats.filesProcessed}`);
        console.log(`  Components found: ${result.stats.componentsFound}`);

        if (result.errors.length > 0) {
          console.log();
          console.log(pc.yellow(`⚠ ${result.errors.length} errors:`));
          result.errors.forEach((err) => {
            console.log(pc.red(`  ${err.filePath}: ${err.message}`));
          });
        }

        // Save output if specified
        if (config.output) {
          const outputData = options.json
            ? JSON.stringify(result, null, 2)
            : JSON.stringify(result.metadata, null, 2);

          await writeFile(config.output, outputData, 'utf-8');
          console.log();
          console.log(pc.green(`✓ Output saved to ${config.output}`));
        }

        process.exit(result.errors.length > 0 ? 1 : 0);
      } catch (error) {
        console.error(pc.red('✗ Error:'), error);
        process.exit(1);
      }
    });

  return command;
}
