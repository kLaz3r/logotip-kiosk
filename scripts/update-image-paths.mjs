#!/usr/bin/env node
/**
 * Update catalogue.json to replace .jpg/.png paths with .webp
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cataloguePath = join(__dirname, "..", "src", "data", "catalogue.json");

async function main() {
  const content = await readFile(cataloguePath, "utf-8");

  // Replace .jpg and .png with .webp in image paths
  // But NOT if already ends with .webp
  // Use a regex that preserves the leading quote mark
  // "/assets/.../xxx.jpg" -> "/assets/.../xxx.webp"
  // "/assets/.../xxx.png" -> "/assets/.../xxx.webp"

  const updated = content.replace(
    /"image":\s*"(\/assets\/[^"]+)\.(jpg|jpeg|png)"/gi,
    '"image": "$1.webp"'
  );

  const jpgCount = (content.match(/\.(jpg|jpeg|png)/gi) || []).length;
  const remainingJpgCount = (updated.match(/\.(jpg|jpeg|png)/gi) || []).length;

  console.log(`Found ${jpgCount} images to update`);
  console.log(`Remaining: ${remainingJpgCount}`);

  if (jpgCount > 0) {
    await writeFile(cataloguePath, updated, "utf-8");
    console.log("✅ Catalogue updated successfully");
  } else {
    console.log("No changes needed");
  }
}

main().catch(console.error);
