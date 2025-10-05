import { promises as fs } from "node:fs";
import path from "node:path";

const workspaceRoot = process.cwd();
const assetsRoot = path.resolve(workspaceRoot, "public/assets");
const outputPath = path.resolve(workspaceRoot, "src/data/catalogue.json");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function toSlug(input) {
  return input
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function humanize(input) {
  const noExt = input.replace(/\.[^.]+$/, "");
  return noExt
    .replace(/[\-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const DEFAULT_CATEGORY_META = {
  mugs: { name: "Căni Personalizate", price: 45, customizable: true },
  tricouri: { name: "Tricouri", price: 75, customizable: true },
  "cutii-etichete-vin": {
    name: "Cutii & Etichete Vin",
    price: 120,
    customizable: true,
  },
  ceasuri: { name: "Ceasuri", price: 150, customizable: false },
  "tocatoare-si-sorturi": {
    name: "Tocătoare & Șorțuri",
    price: 80,
    customizable: true,
  },
};

async function readDirSafe(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function generate() {
  const categories = [];
  const designs = [];

  const categoryDirs = await readDirSafe(assetsRoot);
  for (const dirent of categoryDirs) {
    if (!dirent.isDirectory()) continue;
    const categoryId = dirent.name; // use folder name as id
    const categorySlug = toSlug(categoryId);
    const meta = DEFAULT_CATEGORY_META[categoryId] ?? {
      name: humanize(categoryId),
      price: 50,
      customizable: true,
    };

    const categoryPath = path.join(assetsRoot, categoryId);
    const maybeSubdirs = await readDirSafe(categoryPath);
    const subcategories = [];

    const hasNested = maybeSubdirs.some((d) => d.isDirectory());
    if (hasNested) {
      for (const s of maybeSubdirs) {
        if (!s.isDirectory()) continue;
        const subId = s.name; // keep original folder name as id
        // Remove parent prefix if present (e.g., tricouri- from tricouri-aniversari)
        const subNameBase = subId.replace(new RegExp(`^${categoryId}-`), "");
        const subSlug = toSlug(subNameBase);
        subcategories.push({
          id: subId,
          name: humanize(subNameBase),
          slug: subSlug,
        });

        const subPath = path.join(categoryPath, subId);
        const files = await readDirSafe(subPath);
        for (const f of files) {
          if (!f.isFile()) continue;
          const ext = path.extname(f.name).toLowerCase();
          if (!IMAGE_EXTS.has(ext)) continue;
          const name = humanize(f.name);
          const baseId = toSlug(`${categoryId}-${subId}-${f.name}`);
          designs.push({
            id: baseId,
            categoryId,
            subcategoryId: subId,
            name,
            image: `/assets/${categoryId}/${subId}/${f.name}`,
            price: meta.price,
            description: undefined,
            tags: [],
            customizable: meta.customizable,
            featured: false,
          });
        }
      }
    }

    // Images directly under category
    const files = await readDirSafe(categoryPath);
    for (const f of files) {
      if (!f.isFile()) continue;
      const ext = path.extname(f.name).toLowerCase();
      if (!IMAGE_EXTS.has(ext)) continue;
      const name = humanize(f.name);
      const baseId = toSlug(`${categoryId}-${f.name}`);
      designs.push({
        id: baseId,
        categoryId,
        subcategoryId: null,
        name,
        image: `/assets/${categoryId}/${f.name}`,
        price: meta.price,
        description: undefined,
        tags: [],
        customizable: meta.customizable,
        featured: false,
      });
    }

    categories.push({
      id: categoryId,
      name: meta.name,
      slug: categorySlug,
      description: undefined,
      subcategories,
    });
  }

  // Sort for stable order
  categories.sort((a, b) => a.name.localeCompare(b.name));
  designs.sort((a, b) => a.name.localeCompare(b.name));

  const payload = { categories, designs };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(
    `Catalogue generated: ${path.relative(workspaceRoot, outputPath)}`,
  );
  console.log(`Categories: ${categories.length} | Designs: ${designs.length}`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
