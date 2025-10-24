import fg from "fast-glob";
import { ExtractConfig } from "./types.js";
import path from "node:path";
import { readFile as fsReadFile } from "node:fs/promises";

export async function scanFiles(config: ExtractConfig): Promise<string[]> {
  const files = await fg(config.include, {
    cwd: config.root,
    ignore: config.exclude,
    absolute: true,
    onlyFiles: true,
  });

  return files;
}

export async function readFile(filePath: string): Promise<string> {
  return fsReadFile(filePath, "utf-8");
}

export function getRelativePath(filePath: string, root: string): string {
  return path.relative(root, filePath);
}
