/**
 * Template matcher - matches components to templates based on patterns
 */

import type { Template, TemplateDataContext } from './types';

/**
 * Template matching rule
 */
export interface TemplateMatchRule {
  pattern: string; // Glob pattern or regex
  template: string | Template; // Template path or template object
}

/**
 * Match a component to a template
 */
export function matchTemplate(
  componentData: TemplateDataContext,
  rules: TemplateMatchRule[],
  defaultTemplate?: Template
): Template | null {
  // Try each rule in order
  for (const rule of rules) {
    if (matchesPattern(componentData.filePath, rule.pattern)) {
      // If template is a string, it's a path (needs to be loaded elsewhere)
      // For now, we assume templates are passed as objects
      if (typeof rule.template === 'object') {
        return rule.template;
      }
    }
  }

  // Return default template if no rules matched
  return defaultTemplate || null;
}

/**
 * Match multiple components to templates
 */
export function matchTemplates(
  components: TemplateDataContext[],
  rules: TemplateMatchRule[],
  defaultTemplate?: Template
): Map<string, Template> {
  const matches = new Map<string, Template>();

  for (const component of components) {
    const template = matchTemplate(component, rules, defaultTemplate);
    if (template) {
      matches.set(component.filePath, template);
    }
  }

  return matches;
}

/**
 * Check if a file path matches a pattern
 * Supports simple glob patterns and exact matches
 */
function matchesPattern(filePath: string, pattern: string): boolean {
  // Exact match
  if (filePath === pattern) {
    return true;
  }

  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '.');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}
