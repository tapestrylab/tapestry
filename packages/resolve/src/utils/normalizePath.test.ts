import { describe, it, expect } from "vitest";
import {
  normalizePath,
  isRelativePath,
  isAbsolutePath,
  isUrl,
  isBareModuleSpecifier,
} from "./normalizePath.js";

describe("normalizePath", () => {
  it("should normalize Windows-style paths to Unix-style", () => {
    expect(normalizePath("C:\\Users\\test\\file.ts")).toBe(
      "C:/Users/test/file.ts"
    );
    expect(normalizePath("src\\components\\Button.tsx")).toBe(
      "src/components/Button.tsx"
    );
  });

  it("should leave Unix-style paths unchanged", () => {
    expect(normalizePath("/usr/local/bin/node")).toBe("/usr/local/bin/node");
    expect(normalizePath("src/components/Button.tsx")).toBe(
      "src/components/Button.tsx"
    );
  });
});

describe("isRelativePath", () => {
  it("should identify relative paths starting with ./", () => {
    expect(isRelativePath("./components/Button")).toBe(true);
    expect(isRelativePath("./Button")).toBe(true);
  });

  it("should identify relative paths starting with ../", () => {
    expect(isRelativePath("../components/Button")).toBe(true);
    expect(isRelativePath("../../shared/utils")).toBe(true);
  });

  it("should return false for non-relative paths", () => {
    expect(isRelativePath("react")).toBe(false);
    expect(isRelativePath("@radix-ui/react-popover")).toBe(false);
    expect(isRelativePath("/absolute/path")).toBe(false);
  });
});

describe("isAbsolutePath", () => {
  it("should identify Unix absolute paths", () => {
    expect(isAbsolutePath("/usr/local/bin")).toBe(true);
    expect(isAbsolutePath("/home/user/project")).toBe(true);
  });

  it("should identify Windows absolute paths", () => {
    expect(isAbsolutePath("C:/Users/test")).toBe(true);
    expect(isAbsolutePath("D:\\Projects\\app")).toBe(true);
  });

  it("should return false for non-absolute paths", () => {
    expect(isAbsolutePath("./relative")).toBe(false);
    expect(isAbsolutePath("react")).toBe(false);
    expect(isAbsolutePath("src/components")).toBe(false);
  });
});

describe("isUrl", () => {
  it("should identify HTTP URLs", () => {
    expect(isUrl("http://example.com")).toBe(true);
    expect(isUrl("http://localhost:3000")).toBe(true);
  });

  it("should identify HTTPS URLs", () => {
    expect(isUrl("https://esm.sh/react")).toBe(true);
    expect(isUrl("https://cdn.jsdelivr.net/npm/react")).toBe(true);
  });

  it("should return false for non-URLs", () => {
    expect(isUrl("react")).toBe(false);
    expect(isUrl("./components/Button")).toBe(false);
    expect(isUrl("/absolute/path")).toBe(false);
  });
});

describe("isBareModuleSpecifier", () => {
  it("should identify bare module specifiers", () => {
    expect(isBareModuleSpecifier("react")).toBe(true);
    expect(isBareModuleSpecifier("@radix-ui/react-popover")).toBe(true);
    expect(isBareModuleSpecifier("lodash/debounce")).toBe(true);
  });

  it("should return false for relative paths", () => {
    expect(isBareModuleSpecifier("./Button")).toBe(false);
    expect(isBareModuleSpecifier("../components/Button")).toBe(false);
  });

  it("should return false for absolute paths", () => {
    expect(isBareModuleSpecifier("/usr/local/lib")).toBe(false);
    expect(isBareModuleSpecifier("C:/Users/test")).toBe(false);
  });

  it("should return false for URLs", () => {
    expect(isBareModuleSpecifier("https://esm.sh/react")).toBe(false);
    expect(isBareModuleSpecifier("http://localhost:3000")).toBe(false);
  });
});
