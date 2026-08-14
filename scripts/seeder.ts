import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

if (!fs.existsSync('./prisma')) {
  fs.mkdirSync('./prisma', { recursive: true });
}

const adapter = new PrismaBetterSqlite3({ url: './prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

const CORE_FACTIONS = [
  { name: 'House Atreides', slug: 'house-atreides' },
  { name: 'House Harkonnen', slug: 'house-harkonnen' },
  { name: 'House Corrino', slug: 'house-corrino' },
  { name: 'Fremen', slug: 'fremen' },
  { name: 'Bene Gesserit', slug: 'bene-gesserit' },
  { name: 'Spacing Guild', slug: 'spacing-guild' }
];

const toSlug = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'entity';

/**
 * Removes MediaWiki disambiguation and encyclopedia tags like /DE or /XD from titles.
 */
function cleanWikiTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle.replace(/\/(DE|XD|Expanded)$/i, '').trim();
}

function sanitizeWikitext(rawText: string): string {
  const cutoffIndex = rawText.search(/==\s*(Appearances|Gallery|Apocrypha|Behind the Scenes|Adaptions|References|See also)\s*==/i);
  return cutoffIndex !== -1 ? rawText.substring(0, cutoffIndex) : rawText;
}

function cleanWikiLore(rawText: string): string {
  let text = sanitizeWikitext(rawText);
  text = text.replace(/''+/g, '');
  text = text.replace(/\{\{[\s\S]*?\}\}/g, '');
  text = text.replace(/\[\[File:[^\]]+\]\]/gi, '');
  text = text.replace(/\[https?:\/\/\S+\s+([^\]]+)\]/gi, '$1');
  text = text.replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1');
  text = text.replace(/<[^>]+>/g, '');
  
  const mainHeadings = ['Biography', 'Early Life', 'Arrakis Crisis', 'Location', 'Environment', 'History', 'Culture'];
  for (const heading of mainHeadings) {
    const regex = new RegExp(`(${heading})`, 'g');
    text = text.replace(regex, '\n\n## $1\n\n');
  }
  return text.replace(/\*\s*/g, '\n* ').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();
}

function generateShortLore(loreText: string | null): string | null {
  if (!loreText) return null;
  const clean = loreText.replace(/^##\s+.*$/gm, '').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return clean.substring(0, 150) + '...';
  return sentences.slice(0, 2).join(' ').trim();
}

/**
 * Dynamically parses key-value pairs from any MediaWiki Infobox block.
 * FIXED: Extracts the actual target page name from [[Target|Display]] links.
 */
function parseInfobox(rawText: string): Record<string, string> {
  const result: Record<string, string> = {};
  const infoboxMatch = rawText.match(/\{\{Infobox[\s\S]*?\n\}\}/i);
  if (!infoboxMatch) return result;

  const boxText = infoboxMatch[0];
  const lines = boxText.split('\n');
  for (const line of lines) {
    const match = line.match(/^\|\s*([a-zA-Z0-9_]+)\s*=\s*(.+)$/);
    if (match) {
      const key = match[1].trim().toLowerCase();
      const val = match[2]
        .trim()
        // Extract the target page name before the pipe (e.g., [[Arrakis|The Desert]] -> Arrakis)
        .replace(/\[\[([^\|\]]+)(?:\|[^\]]+)?\]\]/g, '$1')
        .replace(/\{\{[\s\S]*?\}\}/g, '')
        .replace(/<[^>]+>/g, '')
        .trim();
      result[key] = val;
    }
  }
  return result;
}

function generateRandomCoordinate() {
  return { lat: (Math.random() * 180 - 90), lng: (Math.random() * 360 - 180) };
}

async function main() {
  console.log('Reading XML dump...');
  const xmlData = fs.readFileSync('./scripts/Dune_Wiki.xml', 'utf8');
  const parser = new XMLParser();
  const jsonObj = parser.parse(xmlData);

  const rawPages = jsonObj.mediawiki.page;
  const pages = Array.isArray(rawPages) ? rawPages : [rawPages];
  console.log(`Loaded ${pages.length} pages into memory. Starting dynamic scan...\n`);

  // 1. Seed Factions
  for (const f of CORE_FACTIONS) {
    await prisma.faction.upsert({
      where: { slug: f.slug },
      update: { name: f.name },
      create: { name: f.name, slug: f.slug }
    });
  }
  const dbFactions = await prisma.faction.findMany();

  // Track discovered entities for relational mapping
  const discoveredPlanets = new Map<string, string>(); // name.toLowerCase() -> db.id

  // 2. First Pass: Scan and Seed Planets Dynamically
  console.log('--- Scanning Pages for Planets ---');
  for (const page of pages) {
    const rawTitle = page.title;
    if (!rawTitle) continue;
    const title = cleanWikiTitle(rawTitle);
    
    const rawText = typeof page.revision?.text === 'string' ? page.revision.text : page.revision?.text?.['#text'] ?? '';
    const infobox = parseInfobox(rawText);

    const isPlanet = rawText.includes('{{Infobox planet') || infobox.type === 'Planet' || infobox.climate || infobox.population;

    if (isPlanet || ['arrakis', 'caladan', 'giedi prime', 'salusa secundus', 'ix', 'kaitain'].includes(title.toLowerCase())) {
      const lore = cleanWikiLore(rawText);
      const planet = await prisma.planet.upsert({
        where: { slug: toSlug(title) },
        update: { name: title, lore },
        create: { name: title, slug: toSlug(title), lore }
      });
      discoveredPlanets.set(title.toLowerCase(), planet.id);
      console.log(`  [Planet Found] ${title}`);
    }
  }

  if (discoveredPlanets.size === 0) {
    const fallback = await prisma.planet.upsert({
      where: { slug: 'arrakis' },
      update: { name: 'Arrakis' },
      create: { name: 'Arrakis', slug: 'arrakis', lore: 'Default fallback planet.' }
    });
    discoveredPlanets.set('arrakis', fallback.id);
  }

  const defaultPlanetId = Array.from(discoveredPlanets.values())[0];

  // 3. Second Pass: Scan and Seed Landmarks & Settlements Dynamically
  console.log('\n--- Scanning Pages for Landmarks & Settlements ---');
  let landmarkCount = 0;
  for (const page of pages) {
    const rawTitle = page.title;
    if (!rawTitle) continue;
    const title = cleanWikiTitle(rawTitle);
    
    const rawText = typeof page.revision?.text === 'string' ? page.revision.text : page.revision?.text?.['#text'] ?? '';
    const infobox = parseInfobox(rawText);

    const isLandmark = rawText.includes('{{Infobox settlement') || 
                       rawText.includes('{{Infobox location') || 
                       rawText.includes('{{Infobox building') ||
                       infobox.type === 'Settlement' || 
                       infobox.type === 'Location' ||
                       infobox.planet || infobox.location;

    if (isLandmark) {
      const lore = cleanWikiLore(rawText);
      const shortLore = generateShortLore(lore);
      const category = infobox.type || infobox.category || 'Location';
      const subtitle = infobox.subtitle || infobox.native_name || null;
      
      let planetId = defaultPlanetId;
      const planetKey = infobox.planet?.toLowerCase();
      if (planetKey && discoveredPlanets.has(planetKey)) {
        planetId = discoveredPlanets.get(planetKey)!;
      }

      let factionId = null;
      const allegianceKey = (infobox.allegiance || infobox.faction || '').toLowerCase();
      const matchedFaction = dbFactions.find(f => allegianceKey.includes(f.name.toLowerCase()));
      if (matchedFaction) factionId = matchedFaction.id;

      const lm = await prisma.landmark.upsert({
        where: { slug: toSlug(title) },
        update: {
          name: title,
          lore,
          short_lore: shortLore,
          category,
          subtitle,
          planetId,
          factionId
        },
        create: {
          name: title,
          slug: toSlug(title),
          lore,
          short_lore: shortLore,
          category,
          subtitle,
          planetId,
          factionId
        }
      });

      const coords = generateRandomCoordinate();
      await prisma.coordinate.upsert({
        where: { landmarkId: lm.id },
        update: {},
        create: { lat: coords.lat, lng: coords.lng, landmarkId: lm.id }
      });

      landmarkCount++;
      console.log(`  [Landmark Found] ${title} (${category})`);
    }
  }
  console.log(`Successfully parsed and seeded ${landmarkCount} dynamic landmarks.`);

  // 4. Third Pass: Scan and Seed Characters Dynamically
  console.log('\n--- Scanning Pages for Characters ---');
  let characterCount = 0;
  for (const page of pages) {
    const rawTitle = page.title;
    if (!rawTitle) continue;
    const title = cleanWikiTitle(rawTitle);
    
    const rawText = typeof page.revision?.text === 'string' ? page.revision.text : page.revision?.text?.['#text'] ?? '';
    const infobox = parseInfobox(rawText);

    const isCharacter = rawText.includes('{{Infobox character') || 
                        rawText.includes('{{Infobox person') ||
                        infobox.homeworld || 
                        infobox.birthplace || 
                        infobox.allegiance;

    if (isCharacter) {
      const lore = cleanWikiLore(rawText);

      let planetId = defaultPlanetId;
      const homeKey = (infobox.homeworld || infobox.planet || infobox.birthplace || '').toLowerCase();
      for (const [pName, pId] of discoveredPlanets.entries()) {
        if (homeKey.includes(pName)) {
          planetId = pId;
          break;
        }
      }

      let factionId = null;
      const factionKey = (infobox.allegiance || infobox.faction || '').toLowerCase();
      const matchedFaction = dbFactions.find(f => factionKey.includes(f.name.toLowerCase()));
      if (matchedFaction) factionId = matchedFaction.id;

      const existingChar = await prisma.character.findFirst({ where: { name: title } });
      const charData = {
        name: title,
        lore,
        planetId,
        factionId
      };

      if (existingChar) {
        await prisma.character.update({
          where: { id: existingChar.id },
          data: charData
        });
      } else {
        await prisma.character.create({
          data: charData
        });
      }

      characterCount++;
      console.log(`  [Character Found] ${title}`);
    }
  }
  console.log(`Successfully parsed and seeded ${characterCount} dynamic characters.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\nDynamic parsing and seeding completed successfully!');
  })
  .catch(async (e) => {
    console.error('Fatal Seeding Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });