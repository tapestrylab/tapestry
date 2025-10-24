import { loadConfig } from "./config";
import { extract as extractor } from "./extractor";
import { ExtractConfig } from "./types";
export { loadConfig } from "./config";
export * from "./types";

export async function extract(config?: Partial<ExtractConfig>) {
  const fullConfig = await loadConfig(undefined, config);
  return extractor(fullConfig);
}
