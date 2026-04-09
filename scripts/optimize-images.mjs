#!/usr/bin/env node
/**
 * Image optimization script for kiosk
 * Converts JPG/PNG to optimized WebP at appropriate sizes
 * Backs up originals to _originals/
 */
import { fileURLToPath } from "node:url";
import { dirname, join, relative, extname } from "node:path";
import { readdir, stat, rename, mkdir, access } from "node:fs/promises";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config for kiosk display
const MAX_WIDTH = 1200; // Maximum width for kiosk display
const QUALITY = 85; // WebP quality - good balance
const SUFFIX = ""; // In-place replacement

async function findImages(dir) {
  const images = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith("_")) {
      const subImages = await findImages(fullPath);
      images.push(...subImages);
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
        images.push(fullPath);
      }
    }
  }
  return images;
}

async function backupOriginal(srcPath, backupPath) {
  try {
    await access(backupPath);
    return; // Already backed up
  } catch {
    await rename(srcPath, backupPath);
  }
}

async function optimizeImage(imgPath, assetsDir) {
  const relPath = relative(assetsDir, imgPath);
  const ext = extname(imgPath).toLowerCase();
  const baseName = imgPath.slice(0, -(ext.length));
  const outputPath = `${baseName}.webp`;

  // Backup path
  const backupPath = join(
    assetsDir,
    "_originals",
    relPath.slice(0, -(ext.length)) + ext
  );
  const backupDir = dirname(backupPath);

  await mkdir(backupDir, { recursive: true });

  // Get image metadata
  const metadata = await sharp(imgPath).metadata();
  const width = metadata.width;
  const height = metadata.height;

  // Calculate new size
  const targetWidth = Math.min(width, MAX_WIDTH);

  // Process image
  const pipeline = sharp(imgPath)
    .resize({
      width: targetWidth,
      height: undefined, // maintain aspect ratio
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: QUALITY,
      effort: 4, // balance between speed and compression
      smartSubsample: true,
    });

  // Save WebP version
  await pipeline.toFile(outputPath);

  // Get file sizes for comparison
  const originalStats = await stat(imgPath);
  const optimizedStats = await stat(outputPath);

  // Backup original
  await backupOriginal(imgPath, backupPath);

  const savings = originalStats.size - optimizedStats.size;
  const percent = ((savings / originalStats.size) * 100).toFixed(1);

  return {
    path: relPath,
    original: (originalStats.size / 1024).toFixed(1),
    optimized: (optimizedStats.size / 1024).toFixed(1),
    savings,
    percent,
  };
}

async function main() {
  const assetsDir = join(__dirname, "..", "public", "assets");
  const originalSize = await stat(assetsDir).then(() => null).catch(() => null);

  console.log("🔍 Finding images...");
  const images = await findImages(assetsDir);
  console.log(`Found ${images.length} images to optimize\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let errors = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const progress = `[${i + 1}/${images.length}]`;

    try {
      const result = await optimizeImage(img, assetsDir);
      totalOriginal += parseFloat(result.original);
      totalOptimized += parseFloat(result.optimized);

      const origKB = result.original;
      const optKB = result.optimized;
      const sign = result.percent > 0 ? "-" : "+";
      const percent = Math.abs(parseFloat(result.percent)).toFixed(1);

      console.log(`${progress} ${result.path}: ${origKB}KB → ${optKB}KB`);
    } catch (err) {
      errors.push({ path: img, error: err.message });
      console.log(`${progress} ERROR: ${relative(assetsDir, img)} - ${err.message}`);
    }
  }

  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`           Optimization Complete`);
  console.log(`═══════════════════════════════════════════════`);
  console.log(`Total original:   ${(totalOriginal / 1024).toFixed(1)} MB`);
  console.log(`Total optimized:  ${(totalOptimized / 1024).toFixed(1)} MB`);
  console.log(`Space saved:      ${((totalOriginal - totalOptimized) / 1024).toFixed(1)} MB (${(((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(0)}%)`);
  console.log(`═══════════════════════════════════════════════`);

  if (errors.length > 0) {
    console.log(`\n⚠️  ${errors.length} errors occurred`);
  }
}

main().catch(console.error);
