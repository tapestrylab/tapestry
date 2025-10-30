#!/usr/bin/env node

/**
 * Tapestry CLI - Unified command-line interface for all Tapestry tools
 *
 * Provides a single entrypoint for:
 * - tapestry extract: Extract component metadata
 * - tapestry generate: Generate documentation from templates
 * - tapestry list: List available built-in templates
 * - tapestry init: Initialize Tapestry configuration
 */

import { Command } from "commander"
import pc from "picocolors"
import { createExtractCommand } from "./commands/extract.js"
import { createGenerateCommand, createListCommand, createInitCommand } from "./commands/template.js"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get package version
const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, "../package.json"), "utf-8"))

const program = new Command()

program
  .name("tapestry")
  .description("Unified CLI for Tapestry design system documentation tools")
  .version(packageJson.version)
  .addHelpText(
    "after",
    `
${pc.cyan("Examples:")}
  $ tapestry extract --root ./src --output ./metadata.json
  $ tapestry generate --source ./src/Button.tsx --template component-docs
  $ tapestry list
  $ tapestry init

${pc.cyan("Learn more:")}
  Documentation: https://github.com/tapestrylab/tapestry
`
  )

// Add subcommands
program.addCommand(createExtractCommand())
program.addCommand(createGenerateCommand())
program.addCommand(createListCommand())
program.addCommand(createInitCommand())

// Parse command line arguments
program.parse()
