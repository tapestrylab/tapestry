import { describe, it, expect } from 'vitest';
import { generate } from '../src/generator';
import { createTemplate } from '../src/template-builder';
import { extractComponents } from '../src/extract-wrapper';
import path from 'node:path';

describe('Integration Tests', () => {
  it('should extract and generate markdown documentation', async () => {
    // Step 1: Extract component (simpler API with defaults)
    const components = await extractComponents({
      root: path.resolve(__dirname, '../test-fixtures'),
      include: ['Button.tsx'],
    });

    expect(components).toHaveLength(1);
    expect(components[0].name).toBe('Button');

    // Step 2: Create template
    const template = createTemplate('Test Template')
      .setMetadata({ outputFormat: 'markdown' })
      .addHeading(1, '{{name}}')
      .addParagraph('{{description}}', { if: 'description' })
      .addPropsTable('props')
      .toJSON();

    // Step 3: Generate documentation
    const result = await generate({
      data: components[0] as any,
      template,
      outputFormat: 'markdown',
    });

    // Step 4: Verify output
    expect(result.content).toContain('# Button');
    expect(result.content).toContain('Button component for user interactions');
    expect(result.content).toContain('| Prop');
    expect(result.content).toContain('variant');
    expect(result.content).toContain('disabled');
    expect(result.content).toContain('onClick');
  });

  it('should interpolate variables correctly', async () => {
    const components = await extractComponents({
      root: path.resolve(__dirname, '../test-fixtures'),
      include: ['Button.tsx'],
    });

    const template = createTemplate('Variable Test')
      .addHeading(1, '{{name}}')
      .addParagraph('Props: {{props.length}}')
      .addParagraph('First prop: {{props[0].name}}')
      .toJSON();

    const result = await generate({
      data: components[0] as any,
      template,
    });

    expect(result.content).toContain('# Button');
    expect(result.content).toContain('Props: 3');
    expect(result.content).toContain('First prop: variant');
  });

  it('should handle conditionals correctly', async () => {
    const components = await extractComponents({
      root: path.resolve(__dirname, '../test-fixtures'),
      include: ['Button.tsx'],
    });

    const template = createTemplate('Conditional Test')
      .addHeading(1, '{{name}}')
      .addParagraph('Has description', { if: 'description' })
      .addParagraph('Has examples', { if: 'examples.length > 0' })
      .addParagraph('No props', { if: 'props.length === 0' })
      .toJSON();

    const result = await generate({
      data: components[0] as any,
      template,
    });

    // Should show "Has description" and "Has examples"
    expect(result.content).toContain('Has description');
    expect(result.content).toContain('Has examples');
    // Should NOT show "No props"
    expect(result.content).not.toContain('No props');
  });
});
