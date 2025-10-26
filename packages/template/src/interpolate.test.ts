import { describe, it, expect } from 'vitest';
import { getByPath, interpolate, evaluateCondition, shouldRenderBlock } from './interpolate';

describe('getByPath', () => {
  const data = {
    name: 'Button',
    description: 'A button component',
    props: [
      { name: 'variant', type: 'string', required: false },
      { name: 'disabled', type: 'boolean', required: true },
    ],
    metadata: {
      version: '1.0.0',
      author: 'Test',
    },
  };

  it('should get simple property', () => {
    expect(getByPath(data, 'name')).toBe('Button');
    expect(getByPath(data, 'description')).toBe('A button component');
  });

  it('should get nested property', () => {
    expect(getByPath(data, 'metadata.version')).toBe('1.0.0');
    expect(getByPath(data, 'metadata.author')).toBe('Test');
  });

  it('should get array length', () => {
    expect(getByPath(data, 'props.length')).toBe(2);
  });

  it('should get array element by index', () => {
    expect(getByPath(data, 'props[0].name')).toBe('variant');
    expect(getByPath(data, 'props[1].type')).toBe('boolean');
  });

  it('should return undefined for missing property', () => {
    expect(getByPath(data, 'missing')).toBeUndefined();
    expect(getByPath(data, 'props[5].name')).toBeUndefined();
  });

  it('should handle null/undefined values', () => {
    expect(getByPath({ value: null }, 'value')).toBeNull();
    expect(getByPath({ value: undefined }, 'value')).toBeUndefined();
  });
});

describe('interpolate', () => {
  const data = {
    name: 'Button',
    description: 'A button component',
    count: 5,
    active: true,
    props: [
      { name: 'variant', type: 'string' },
      { name: 'disabled', type: 'boolean' },
    ],
  };

  it('should interpolate simple variables', () => {
    expect(interpolate('{{name}}', data)).toBe('Button');
    expect(interpolate('Component: {{name}}', data)).toBe('Component: Button');
  });

  it('should interpolate nested properties', () => {
    expect(interpolate('{{props[0].name}}', data)).toBe('variant');
    expect(interpolate('Type: {{props[1].type}}', data)).toBe('Type: boolean');
  });

  it('should interpolate numbers', () => {
    expect(interpolate('Count: {{count}}', data)).toBe('Count: 5');
  });

  it('should interpolate booleans', () => {
    expect(interpolate('Active: {{active}}', data)).toBe('Active: true');
  });

  it('should handle missing variables', () => {
    expect(interpolate('{{missing}}', data)).toBe('');
    expect(interpolate('Value: {{missing}}', data)).toBe('Value: ');
  });

  it('should handle multiple variables', () => {
    expect(interpolate('{{name}} has {{count}} items', data)).toBe(
      'Button has 5 items'
    );
  });

  it('should handle array length', () => {
    expect(interpolate('Props: {{props.length}}', data)).toBe('Props: 2');
  });
});

describe('evaluateCondition', () => {
  const data = {
    name: 'Button',
    description: 'A button',
    deprecated: false,
    props: [
      { name: 'variant', type: 'string' },
      { name: 'disabled', type: 'boolean' },
    ],
    examples: [],
    exportType: 'named',
    count: 5,
  };

  it('should evaluate truthy checks', () => {
    expect(evaluateCondition('name', data)).toBe(true);
    expect(evaluateCondition('description', data)).toBe(true);
  });

  it('should evaluate falsy checks', () => {
    expect(evaluateCondition('missing', data)).toBe(false);
    expect(evaluateCondition('deprecated', data)).toBe(false);
  });

  it('should evaluate array length checks', () => {
    expect(evaluateCondition('props.length > 0', data)).toBe(true);
    expect(evaluateCondition('examples.length > 0', data)).toBe(false);
    expect(evaluateCondition('props.length > 5', data)).toBe(false);
  });

  it('should evaluate equality checks', () => {
    expect(evaluateCondition('exportType === "named"', data)).toBe(true);
    expect(evaluateCondition("exportType === 'named'", data)).toBe(true);
    expect(evaluateCondition('exportType === "default"', data)).toBe(false);
  });

  it('should evaluate inequality checks', () => {
    expect(evaluateCondition('exportType !== "default"', data)).toBe(true);
    expect(evaluateCondition('exportType !== "named"', data)).toBe(false);
  });

  it('should evaluate less than checks', () => {
    expect(evaluateCondition('count < 10', data)).toBe(true);
    expect(evaluateCondition('count < 3', data)).toBe(false);
  });

  it('should handle empty arrays as falsy', () => {
    expect(evaluateCondition('examples', data)).toBe(false);
  });

  it('should handle non-empty arrays as truthy', () => {
    expect(evaluateCondition('props', data)).toBe(true);
  });
});

describe('shouldRenderBlock', () => {
  const data = {
    description: 'A button',
    props: [{ name: 'variant' }],
    examples: [],
  };

  it('should render block without condition', () => {
    expect(shouldRenderBlock(undefined, data)).toBe(true);
  });

  it('should render block when condition is true', () => {
    expect(shouldRenderBlock('description', data)).toBe(true);
    expect(shouldRenderBlock('props.length > 0', data)).toBe(true);
  });

  it('should not render block when condition is false', () => {
    expect(shouldRenderBlock('missing', data)).toBe(false);
    expect(shouldRenderBlock('examples.length > 0', data)).toBe(false);
  });
});
