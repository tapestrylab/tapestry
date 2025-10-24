import { cosmiconfig } from "cosmiconfig";
import { ExtractConfig, ExtractConfigSchema } from "./types.js";
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

  // Merge with CLI overrides
  const defaults = ExtractConfigSchema.parse({
    include: ["**/*.{tsx,jsx,ts,js}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/build/**",
      "**/*.test.{tsx,ts,jsx,js}",
      "**/*.spec.{tsx,ts,jsx,js}",
    ],
    output: "./metadata.json",
  });

  const merged = deepmerge(defaults, loadedConfig, cliOverrides);

  // Validate and return
  return ExtractConfigSchema.parse(merged);
}
