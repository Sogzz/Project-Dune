import * as fs from 'fs';
import * as readline from 'readline';

// Exclusion blocklist (case-insensitive)
const EXCLUDED_TEMPLATES = new Set([
  'de-or,ex',
  'or-de,ex',
  'original',
  'delete',
  'imageinfo',
  'sitename',
  'encyclopedia',
  'succession',
  'permission',
]);

async function streamTemplates(filePath: string) {
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let liveCounter = 1;
  // Map to hold raw template name -> occurrence count
  const templateCounts = new Map<string, number>();

  // Pattern captures '{{' followed by optional space, then reads all characters up to a space, pipe '|', brace '}', or '#'
  const templatePattern = /\{\{\s*([^\s\}\|#]+)/g;

  for await (const line of rl) {
    const matches = line.matchAll(templatePattern);

    for (const match of matches) {
      const rawWord = match[1].trim();
      const normalizedWord = rawWord.toLowerCase();

      if (rawWord && !EXCLUDED_TEMPLATES.has(normalizedWord)) {
        // 1. Print live match
        console.log(`${liveCounter}. {{${rawWord}`);
        liveCounter++;

        // 2. Increment count in map
        const currentCount = templateCounts.get(rawWord) || 0;
        templateCounts.set(rawWord, currentCount + 1);
      }
    }
  }

  // --- Summary Phase ---
  console.log('\n=== FINAL SUMMARY COUNTS ===\n');

  // Sort by count descending
  const sortedTemplates = Array.from(templateCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  let summaryIndex = 1;

  for (const [template, count] of sortedTemplates) {
    // Filter out templates with 4 or fewer occurrences
    if (count <= 4) {
      continue;
    }

    const formattedTag = `{{${template}`.padEnd(20, ' ');
    console.log(`${summaryIndex}. ${formattedTag} ->  ${count}`);
    summaryIndex++;
  }
}

// Run against your XML file
streamTemplates('./dune_pages_current.xml');