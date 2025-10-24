/**
 * Type guards for React component detection
 * Pure predicates for identifying component patterns and JSX
 */

export const isReactComponent = (name: string | undefined, node: any): boolean =>
  !!name && /^[A-Z]/.test(name) && hasJSXReturn(node);

export const isArrowOrFunction = (node: any): boolean =>
  node?.type === "ArrowFunctionExpression" ||
  node?.type === "FunctionExpression";

export const isJSXNode = (node: any): boolean =>
  node?.type === "JSXElement" || node?.type === "JSXFragment";

export const hasJSXReturn = (node: any): boolean => {
  if (!node) return false;

  // Handle arrow functions with implicit returns (including parenthesized expressions)
  if (node.type === "ArrowFunctionExpression" && node.expression) {
    return hasJSXInExpression(node.body);
  }

  return node.body?.type === "BlockStatement" && hasJSXInBlock(node.body);
};

export const hasJSXInBlock = (block: any): boolean =>
  Array.isArray(block?.body) &&
  block.body.some(
    (stmt: any) =>
      stmt.type === "ReturnStatement" && hasJSXInExpression(stmt.argument)
  );

export const hasJSXInExpression = (node: any): boolean => {
  if (!node) return false;
  if (isJSXNode(node)) return true;

  const checkMap: Record<string, (n: any) => boolean> = {
    ConditionalExpression: (n) =>
      hasJSXInExpression(n.consequent) || hasJSXInExpression(n.alternate),
    LogicalExpression: (n) =>
      hasJSXInExpression(n.left) || hasJSXInExpression(n.right),
    ParenthesizedExpression: (n) => hasJSXInExpression(n.expression),
  };

  return checkMap[node.type]?.(node) ?? false;
};
