import { describe, it, expect } from 'vitest';
import { extractComponents } from '../src/extract-wrapper';
import path from 'node:path';

describe('Debug Extract', () => {
  it('should extract Button component with props', async () => {
    const components = await extractComponents({
      root: path.resolve(__dirname, '../test-fixtures'),
      include: ['Button.tsx'],
      exclude: [],
      output: '',
    });

    console.log('Extracted components:', JSON.stringify(components, null, 2));

    expect(components).toHaveLength(1);
    const button = components[0];

    console.log('Button name:', button.name);
    console.log('Button props count:', button.props?.length || 0);
    console.log('Button props:', button.props);
  });
});
