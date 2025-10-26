import { cosmiconfig } from "cosmiconfig";
import { ExtractConfig, ExtractConfigSchema, DEFAULT_INCLUDE, DEFAULT_EXCLUDE } from "./types.js";
import path from "node:path";
import { deepmerge } from "deepmerge-ts";

const explorer = cosmiconfig("tapestry", {
  searchPlaces: [
    "tapestry.config.js",
    "tapestry.config.ts",
    "tapestry.config.mjs",
    "tapestry.config.cjs",
    ".tapestryrc",
    ".tapestryrc.json",
    ".tapestryrc.js",
  ],
});

/**
 * Normalize and validate extract config
 */
export function normalizeExtractConfig(
  config: Partial<ExtractConfig>
): ExtractConfig {
  return ExtractConfigSchema.parse(config);
}

export async function loadConfig(
  configPath?: string,
  cliOverrides?: Partial<ExtractConfig>
): Promise<ExtractConfig> {
  let loadedConfig: Partial<ExtractConfig> = {};

  try {
    const result = configPath
      ? await explorer.load(path.resolve(configPath))
      : await explorer.search();

    if (result && !result.isEmpty) {
      loadedConfig = result.config.extract || result.config;
    } else {
      console.warn("No config file found, using defaults");
    }
  } catch (error) {
    console.warn("No config file found, using defaults");
  }

  // Merge with CLI overrides (schema will apply defaults)
  const merged = deepmerge(loadedConfig, cliOverrides || {});

  // Validate and return with defaults applied
  return normalizeExtractConfig(merged);
}
