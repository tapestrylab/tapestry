/**
 * Normalize a file path to use forward slashes
 */
export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

/**
 * Check if a string is a relative path
 */
export function isRelativePath(id: string): boolean {
  return id.startsWith("./") || id.startsWith("../");
}

/**
 * Check if a string is an absolute path
 */
export function isAbsolutePath(id: string): boolean {
  return id.startsWith("/") || /^[a-zA-Z]:/.test(id);
}

/**
 * Check if a string is a URL
 */
export function isUrl(id: string): boolean {
  return /^https?:\/\//.test(id);
}

/**
 * Check if a string looks like a bare npm module specifier
 */
export function isBareModuleSpecifier(id: string): boolean {
  return !isRelativePath(id) && !isAbsolutePath(id) && !isUrl(id);
}
