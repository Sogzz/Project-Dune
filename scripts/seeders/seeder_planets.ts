import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser'; // <--- Use fast-xml-parser
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

function cleanWikitext(text: string): string {
  if (!text) return '';

  return text
    .replace(/(?:<|&lt;)ref.*?(?:>|&gt;).*?(?:(?:<|&lt;)\/ref(?:>|&gt;)|(?:\/|&gt;))/gis, '')
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/'''+|''/g, '')
    .replace(/\[https?:\/\/[^\s\]]+\s+([^\]]+)\]/g, '$1')
    .replace(/\[\[Category:[^\]]+\]\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseInfobox(infoboxText: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = infoboxText.split(/\n\s*\|/);

  for (const line of lines) {
    const match = line.match(/^\s*([^=]+)=(.*)$/s);
    if (match) {
      const key = match[1].trim().toLowerCase();
      const value = cleanWikitext(match[2].trim());
      result[key] = value;
    }
  }

  return result;
}

export async function seedPlanets(prisma: PrismaClient, xmlFilePath: string) {
  console.log('🌱 Starting Planet Seeder from XML...');

  if (!fs.existsSync(xmlFilePath)) {
    throw new Error(`XML file not found at path: ${xmlFilePath}`);
  }

  const xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');

  // 1. Parse XML into clean JS Objects (No regex truncation!)
  const parser = new XMLParser();
  const jsonObj = parser.parse(xmlContent);

  const rawPages = jsonObj?.mediawiki?.page;
  if (!rawPages) {
    console.warn('⚠️ No <page> nodes found in XML.');
    return;
  }

  const pages = Array.isArray(rawPages) ? rawPages : [rawPages];
  let seededCount = 0;

  for (const page of pages) {
    const rawTitle = page?.title;
    if (!rawTitle || typeof rawTitle !== 'string') continue;

    // Filter out Wiki meta-pages (Templates, Talk pages, Categories)
    if (rawTitle.includes(':')) continue;

    // Safely extract raw text from parsed XML
    const textContent = typeof page.revision?.text === 'string'
      ? page.revision.text
      : page.revision?.text?.['#text'] ?? '';

    if (!textContent) continue;

    // Match flexible {{Planet or {{Infobox planet detection
    const planetTemplateRegex = /\{\{\s*(?:Infobox\s+)?Planet(?:[_\s]*Infobox)?\b/i;   
    const templateStartIndex = textContent.search(planetTemplateRegex);

    if (templateStartIndex === -1) continue;

    // Locate matching closing braces }}
    let braceCount = 0;
    let templateEndIndex = -1;

    for (let i = templateStartIndex; i < textContent.length - 1; i++) {
      if (textContent[i] === '{' && textContent[i + 1] === '{') {
        braceCount++;
        i++;
      } else if (textContent[i] === '}' && textContent[i + 1] === '}') {
        braceCount--;
        i++;
        if (braceCount === 0) {
          templateEndIndex = i + 1;
          break;
        }
      }
    }

    if (templateEndIndex === -1) {
      console.warn(`⚠️ Could not find closing '}}' for Planet infobox on page: ${rawTitle}`);
      continue;
    }

    const infoboxContent = textContent.substring(templateStartIndex, templateEndIndex);
    const parsedFields = parseInfobox(infoboxContent);

    const rawLore = textContent.substring(templateEndIndex);
    const cleanLore = cleanWikitext(rawLore);

    const slug = rawTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const planetData = {
      slug: slug,
      name: rawTitle,
      lore: cleanLore || null,
      language: parsedFields['language'] || null,
      population: parsedFields['population'] || null,
      satellites: parsedFields['satellites'] || null,
      primaryExport: parsedFields['major industries and products'] || parsedFields['export'] || null,
      climate: parsedFields['climate'] || null,
      sector: parsedFields['sector'] || null,
      gravity: parsedFields['gravity'] || null,
    };

    await prisma.planet.upsert({
      where: { slug: planetData.slug },
      update: planetData,
      create: planetData,
    });

    seededCount++;
    console.log(`✅ Upserted Planet: ${planetData.name} (${planetData.slug})`);
  }

  console.log(`🎉 Finished Planet Seeder. Total Planets processed: ${seededCount}`);
}

// -------------------------------------------------------------
// STANDALONE TEST RUNNER
// -------------------------------------------------------------
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const adapter = new PrismaBetterSqlite3({ url: './prisma/dev.db' });
  const prisma = new PrismaClient({ adapter });

  const xmlFilePath = path.join(process.cwd(), 'scripts/Dune_Wiki.xml');

  seedPlanets(prisma, xmlFilePath)
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Seeder Error:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}