export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageType = (typeof allowedImageTypes)[number];

const hasPrefix = (buffer: Buffer, signature: number[]) =>
  signature.every((byte, index) => buffer[index] === byte);

export const detectImageType = (buffer: Buffer): AllowedImageType | null => {
  if (hasPrefix(buffer, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (hasPrefix(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  const isWebp =
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";

  return isWebp ? "image/webp" : null;
};

export const validateImageBuffer = (
  buffer: Buffer,
  declaredType: string,
  size: number
) => {
  if (size <= 0) {
    return { valid: false, error: "The selected image is empty." } as const;
  }

  if (size > MAX_IMAGE_SIZE) {
    return { valid: false, error: "Image must be smaller than 5MB." } as const;
  }

  if (!allowedImageTypes.includes(declaredType as AllowedImageType)) {
    return { valid: false, error: "Upload a JPEG, PNG, or WebP image." } as const;
  }

  const detectedType = detectImageType(buffer);

  if (!detectedType || detectedType !== declaredType) {
    return {
      valid: false,
      error: "The file contents do not match a supported image format.",
    } as const;
  }

  return { valid: true, type: detectedType } as const;
};
