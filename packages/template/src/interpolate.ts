/**
 * Variable interpolation system for templates
 *
 * Supports {{variable}} syntax with JSONPath-like access
 * Examples:
 *   {{name}} → data.name
 *   {{props.length}} → data.props.length
 *   {{props[0].name}} → data.props[0].name
 */

const VAR_REGEX = /\{\{([^}]+)\}\}/g;

/**
 * Get value from object using JSONPath-like syntax
 */
export function getByPath(obj: any, path: string): any {
  const trimmedPath = path.trim();

  return trimmedPath.split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) {
      return undefined;
    }

    // Handle array access: props[0] or items[2]
    const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      const array = acc[arrayKey];
      return Array.isArray(array) ? array[parseInt(index, 10)] : undefined;
    }

    // Handle direct array index: [0] when acc is already an array
    const directIndexMatch = key.match(/^\[(\d+)\]$/);
    if (directIndexMatch) {
      const index = parseInt(directIndexMatch[1], 10);
      return Array.isArray(acc) ? acc[index] : undefined;
    }

    return acc[key];
  }, obj);
}

/**
 * Interpolate variables in a string
 */
export function interpolate(text: string, data: any): string {
  return text.replace(VAR_REGEX, (_, path) => {
    const value = getByPath(data, path);

    // Handle undefined/null
    if (value === undefined || value === null) {
      return '';
    }

    // Handle boolean
    if (typeof value === 'boolean') {
      return value.toString();
    }

    // Handle arrays and objects (JSON stringify)
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  });
}

/**
 * Evaluate a conditional expression
 * Supports:
 *   - Truthy checks: "description", "deprecated"
 *   - Length checks: "props.length > 0", "examples.length > 0"
 *   - Equality: "exportType === 'default'"
 *   - Inequality: "since !== undefined"
 */
export function evaluateCondition(condition: string, data: any): boolean {
  const trimmed = condition.trim();

  // Handle comparison operators
  if (trimmed.includes('>')) {
    const [left, right] = trimmed.split('>').map((s) => s.trim());
    const leftValue = getByPath(data, left);
    const rightValue = parseFloat(right);
    return typeof leftValue === 'number' && leftValue > rightValue;
  }

  if (trimmed.includes('<')) {
    const [left, right] = trimmed.split('<').map((s) => s.trim());
    const leftValue = getByPath(data, left);
    const rightValue = parseFloat(right);
    return typeof leftValue === 'number' && leftValue < rightValue;
  }

  if (trimmed.includes('===')) {
    const [left, right] = trimmed.split('===').map((s) => s.trim());
    const leftValue = getByPath(data, left);
    // Remove quotes from string literals
    const rightValue = right.replace(/^["']|["']$/g, '');
    return leftValue === rightValue;
  }

  if (trimmed.includes('!==')) {
    const [left, right] = trimmed.split('!==').map((s) => s.trim());
    const leftValue = getByPath(data, left);
    // Handle undefined/null comparisons
    if (right === 'undefined') {
      return leftValue !== undefined;
    }
    if (right === 'null') {
      return leftValue !== null;
    }
    const rightValue = right.replace(/^["']|["']$/g, '');
    return leftValue !== rightValue;
  }

  // Simple truthy check
  const value = getByPath(data, trimmed);

  // Handle arrays - check if non-empty
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  // Handle boolean values explicitly
  if (typeof value === 'boolean') {
    return value;
  }

  // Handle strings - check if non-empty
  if (typeof value === 'string') {
    return value.length > 0;
  }

  // Handle numbers - check if not 0
  if (typeof value === 'number') {
    return value !== 0;
  }

  // General truthy check
  return Boolean(value);
}

/**
 * Check if a block should be rendered based on its condition
 */
export function shouldRenderBlock(
  condition: string | undefined,
  data: any
): boolean {
  if (!condition) {
    return true; // No condition means always render
  }

  return evaluateCondition(condition, data);
}
