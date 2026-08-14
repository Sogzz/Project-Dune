import * as fs from 'fs';
import * as readline from 'readline';

// Exact match blocklist (case-insensitive)
const EXCLUDED_CATEGORIES = new Set<string>([
  // Add exact category names you want to skip here later
]);

// Prefixes to ignore (skips 'Images of...', 'Image...', etc.)
const EXCLUDED_PREFIXES = ['image', 'images'];

async function streamCategories(filePath: string) {
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let liveCounter = 1;
  const categoryCounts = new Map<string, number>();

  // REGEX BREAKDOWN: /\[\[Category:\s*([^\]|\n]+)/gi
  // Matches '[[Category:' (case-insensitive) and grabs up to '|' (sort keys), ']', or newline
  const categoryPattern = /\[\[Category:\s*([^\]|\n]+)/gi;

  for await (const line of rl) {
    const matches = line.matchAll(categoryPattern);

    for (const match of matches) {
      const rawCategory = match[1].trim();
      const normalized = rawCategory.toLowerCase();

      if (!rawCategory) continue;

      // 1. Filter out anything starting with "image" or "images"
      const isImageCategory = EXCLUDED_PREFIXES.some((prefix) =>
        normalized.startsWith(prefix)
      );
      if (isImageCategory) continue;

      // 2. Filter out exact blocklist entries
      if (EXCLUDED_CATEGORIES.has(normalized)) continue;

      // --- Live Stream Output ---
      console.log(`${liveCounter}. [[Category:${rawCategory}`);
      liveCounter++;

      // --- Count Tracking ---
      const currentCount = categoryCounts.get(rawCategory) || 0;
      categoryCounts.set(rawCategory, currentCount + 1);
    }
  }

  // --- Summary Phase ---
  console.log('\n=== FINAL CATEGORY SUMMARY (Occurrences >= 4) ===\n');

  const sortedCategories = Array.from(categoryCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  let summaryIndex = 1;

  for (const [category, count] of sortedCategories) {
    // Filter out categories with 4 or fewer occurrences
    if (count < 4) {
      continue;
    }

    const formattedTag = `[[Category:${category}`.padEnd(35, ' ');
    console.log(`${summaryIndex}. ${formattedTag} ->  ${count}`);
    summaryIndex++;
  }
}

// Run against your XML file
streamCategories('./dune_pages_current.xml');