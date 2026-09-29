import { describe, expect, it } from "vitest";
import {
  MAX_IMAGE_SIZE,
  detectImageType,
  validateImageBuffer,
} from "./imageValidation";

describe("image validation", () => {
  it("detects supported image signatures", () => {
    expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe("image/jpeg");
    expect(
      detectImageType(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      )
    ).toBe("image/png");
    expect(detectImageType(Buffer.from("RIFF0000WEBP", "ascii"))).toBe("image/webp");
  });

  it("rejects a MIME type that does not match the file signature", () => {
    const result = validateImageBuffer(
      Buffer.from([0xff, 0xd8, 0xff, 0x00]),
      "image/png",
      4
    );

    expect(result.valid).toBe(false);
  });

  it("rejects unsupported and oversized files", () => {
    expect(
      validateImageBuffer(Buffer.from("<svg />"), "image/svg+xml", 7).valid
    ).toBe(false);
    expect(
      validateImageBuffer(
        Buffer.from([0xff, 0xd8, 0xff]),
        "image/jpeg",
        MAX_IMAGE_SIZE + 1
      ).valid
    ).toBe(false);
  });
});
