---
'@tapestrylab/template': minor
---

feat(template): add CLI tool for zero-code documentation generation

Adds a comprehensive CLI tool with the following commands:

- `generate`: Generate documentation from component source files with support for templates, themes, and multiple output formats
- `list`: Display all available built-in templates with descriptions
- `init`: Scaffold configuration files (tapestry.config.js, custom template, custom theme)

The CLI supports:
- Single file or batch directory generation
- Built-in and custom templates
- Custom themes
- Markdown, MDX, and HTML output formats
- Relationship resolution (dependencies, usage sites)
