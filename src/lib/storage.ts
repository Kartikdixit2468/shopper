import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const uploadRoot = path.join(process.cwd(), ".data", "uploads");
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function saveImageFile(file: File) {
  const extension = allowedTypes.get(file.type);
  if (!extension) throw new Error("Use a JPG, PNG, or WebP image.");
  if (!file.size || file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be smaller than 5 MB.");
  }

  await mkdir(uploadRoot, { recursive: true });
  const storageKey = `${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadRoot, storageKey), Buffer.from(await file.arrayBuffer()), {
    flag: "wx",
  });

  return { storageKey, mimeType: file.type, bytes: file.size };
}

export async function readImageFile(storageKey: string) {
  if (!/^[a-f0-9-]+\.(?:jpg|png|webp)$/.test(storageKey)) {
    throw new Error("Invalid media key.");
  }
  return readFile(path.join(uploadRoot, storageKey));
}
