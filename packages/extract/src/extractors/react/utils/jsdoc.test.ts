import { describe, it, expect } from "vitest";
import { extractJSDoc } from "./jsdoc.js";

describe("extractJSDoc - description extraction", () => {
  it("should extract simple JSDoc comment", () => {
    const content = `
/** This is a button component */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)?.description).toBe(
      "This is a button component"
    );
  });

  it("should extract multi-line JSDoc comment", () => {
    const content = `
/**
 * A button component
 * that handles clicks
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)?.description).toBe(
      "A button component that handles clicks"
    );
  });

  it("should ignore JSDoc tags", () => {
    const content = `
/**
 * A button component
 * @param props Component props
 * @returns JSX element
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)?.description).toBe("A button component");
  });

  it("should handle JSDoc with only tags", () => {
    const content = `
/**
 * @param props Component props
 * @returns JSX element
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)?.description).toBeUndefined();
  });

  it("should handle mixed content and tags", () => {
    const content = `
/**
 * A versatile button component
 * for interactive actions
 * @example
 * <Button onClick={handleClick}>Click me</Button>
 * @param props Button properties
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    // The implementation now properly parses @example tags
    // so they are not included in the description
    expect(extractJSDoc(node, content)?.description).toBe(
      "A versatile button component for interactive actions"
    );
  });

  it("should handle JSDoc with irregular spacing", () => {
    const content = `
/**
 *A button component
 *   with irregular spacing
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)?.description).toBe(
      "A button component with irregular spacing"
    );
  });

  it("should handle JSDoc without asterisks", () => {
    const content = `
/**
This is a simple comment
without asterisks
*/
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)?.description).toBe(
      "This is a simple comment without asterisks"
    );
  });

  it("should return undefined for node without start", () => {
    const content = "function Button() {}";
    const node = {};
    expect(extractJSDoc(node, content)).toBeUndefined();
  });

  it("should return undefined for node with undefined start", () => {
    const content = "function Button() {}";
    const node = { start: undefined };
    expect(extractJSDoc(node, content)).toBeUndefined();
  });

  it("should return undefined when no JSDoc comment exists", () => {
    const content = `
// Regular comment
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)).toBeUndefined();
  });

  it("should return undefined for empty JSDoc", () => {
    const content = `
/** */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)?.description).toBeUndefined();
  });

  it("should return undefined for JSDoc with only whitespace", () => {
    const content = `
/**
 *
 *
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)?.description).toBeUndefined();
  });

  it("should handle JSDoc comment immediately before node", () => {
    const content = `/** Button component */function Button() {}`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)?.description).toBe("Button component");
  });

  it("should handle JSDoc with extra whitespace before node", () => {
    const content = `
/**
 * Button component
 */


function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)?.description).toBe("Button component");
  });

  it("should not extract if JSDoc is not immediately before node", () => {
    const content = `
/** Button component */
const x = 1;
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)).toBeUndefined();
  });

  it("should handle complex JSDoc with special characters", () => {
    const content = `
/**
 * A button component that supports <special> characters & symbols!
 * Including quotes "like" this and 'that'
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    expect(extractJSDoc(node, content)?.description).toBe(
      "A button component that supports <special> characters & symbols! Including quotes \"like\" this and 'that'"
    );
  });
});

describe("extractJSDoc", () => {
  it("should extract single-line example", () => {
    const content = `
/**
 * A button component
 * @example
 * <Button title="Submit" onClick={handleSubmit} />
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    const jsdoc = extractJSDoc(node, content);
    expect(jsdoc?.examples).toEqual([
      '<Button title="Submit" onClick={handleSubmit} />',
    ]);
  });

  it("should extract multi-line example", () => {
    const content = `
/**
 * A button component
 * @example
 * <Button
 *   title="Submit"
 *   onClick={handleSubmit}
 * />
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    const jsdoc = extractJSDoc(node, content);
    expect(jsdoc?.examples).toEqual([
      '<Button\ntitle="Submit"\nonClick={handleSubmit}\n/>',
    ]);
  });

  it("should extract multiple examples", () => {
    const content = `
/**
 * A button component
 * @example
 * <Button title="Submit" />
 * @example
 * <Button title="Cancel" onClick={handleCancel} />
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    const jsdoc = extractJSDoc(node, content);
    expect(jsdoc?.examples).toEqual([
      '<Button title="Submit" />',
      '<Button title="Cancel" onClick={handleCancel} />',
    ]);
  });

  it("should extract example with content on same line as tag", () => {
    const content = `
/**
 * @example <Button title="Click me" />
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    const jsdoc = extractJSDoc(node, content);
    expect(jsdoc?.examples).toEqual(['<Button title="Click me" />']);
  });

  it("should extract all JSDoc fields including examples, excluding returns", () => {
    const content = `
/**
 * A beautiful button component
 * @param {string} title - The button label
 * @example
 * <Button title="Submit" onClick={handleSubmit} />
 * @returns {JSX.Element} The rendered button
 * @see {@link https://example.com}
 * @since 1.0.0
 * @deprecated Use NewButton instead
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    const jsdoc = extractJSDoc(node, content);

    expect(jsdoc?.description).toBe("A beautiful button component");
    expect(jsdoc?.examples).toEqual([
      '<Button title="Submit" onClick={handleSubmit} />',
    ]);
    expect(jsdoc?.see).toEqual(["https://example.com"]);
    expect(jsdoc?.since).toBe("1.0.0");
    expect(jsdoc?.deprecated).toBe("Use NewButton instead");
    expect(jsdoc?.paramDescriptions?.get("title")).toBe("The button label");
  });

  it("should handle JSDoc without examples", () => {
    const content = `
/**
 * A button component
 * @param {string} title
 */
function Button() {}
`;
    const node = { start: content.indexOf("function") };
    const jsdoc = extractJSDoc(node, content);
    expect(jsdoc?.examples).toBeUndefined();
  });
});
