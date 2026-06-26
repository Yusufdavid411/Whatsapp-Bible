const BOOKS = [
  ['Genesis', ['genesis', 'gen', 'ge', 'gn']],
  ['Exodus', ['exodus', 'exod', 'exo', 'ex']],
  ['Leviticus', ['leviticus', 'lev', 'le', 'lv']],
  ['Numbers', ['numbers', 'num', 'nu', 'nm', 'nb']],
  ['Deuteronomy', ['deuteronomy', 'deut', 'deu', 'dt']],
  ['Joshua', ['joshua', 'josh', 'jos', 'jsh']],
  ['Judges', ['judges', 'judg', 'jdg', 'jg', 'jdgs']],
  ['Ruth', ['ruth', 'rut', 'ru']],
  ['1 Samuel', ['1 samuel', '1samuel', '1 sam', '1sam', 'i samuel', 'i sam']],
  ['2 Samuel', ['2 samuel', '2samuel', '2 sam', '2sam', 'ii samuel', 'ii sam']],
  ['1 Kings', ['1 kings', '1kings', '1 kgs', '1kgs', 'i kings', 'i kgs']],
  ['2 Kings', ['2 kings', '2kings', '2 kgs', '2kgs', 'ii kings', 'ii kgs']],
  ['1 Chronicles', ['1 chronicles', '1chronicles', '1 chron', '1chron', '1 chr', '1chr', 'i chronicles']],
  ['2 Chronicles', ['2 chronicles', '2chronicles', '2 chron', '2chron', '2 chr', '2chr', 'ii chronicles']],
  ['Ezra', ['ezra', 'ezr']],
  ['Nehemiah', ['nehemiah', 'neh', 'ne']],
  ['Esther', ['esther', 'esth', 'est']],
  ['Job', ['job', 'jb']],
  ['Psalm', ['psalm', 'psalms', 'ps', 'psa', 'psm', 'pss']],
  ['Proverbs', ['proverbs', 'prov', 'pro', 'prv', 'pr']],
  ['Ecclesiastes', ['ecclesiastes', 'eccles', 'eccle', 'ecc', 'ec']],
  ['Song of Solomon', ['song of solomon', 'song', 'songs', 'song of songs', 'sos', 'canticles']],
  ['Isaiah', ['isaiah', 'isa', 'is']],
  ['Jeremiah', ['jeremiah', 'jer', 'je', 'jr']],
  ['Lamentations', ['lamentations', 'lam', 'la']],
  ['Ezekiel', ['ezekiel', 'ezek', 'eze', 'ezk']],
  ['Daniel', ['daniel', 'dan', 'da', 'dn']],
  ['Hosea', ['hosea', 'hos', 'ho']],
  ['Joel', ['joel', 'joe', 'jl']],
  ['Amos', ['amos', 'amo', 'am']],
  ['Obadiah', ['obadiah', 'obad', 'ob']],
  ['Jonah', ['jonah', 'jon', 'jnh']],
  ['Micah', ['micah', 'mic', 'mc']],
  ['Nahum', ['nahum', 'nah', 'na']],
  ['Habakkuk', ['habakkuk', 'hab', 'hb']],
  ['Zephaniah', ['zephaniah', 'zeph', 'zep', 'zp']],
  ['Haggai', ['haggai', 'hag', 'hg']],
  ['Zechariah', ['zechariah', 'zech', 'zec', 'zc']],
  ['Malachi', ['malachi', 'mal', 'ml']],
  ['Matthew', ['matthew', 'matt', 'mat', 'mt']],
  ['Mark', ['mark', 'mrk', 'mk', 'mr']],
  ['Luke', ['luke', 'luk', 'lk']],
  ['John', ['john', 'jhn', 'jn']],
  ['Acts', ['acts', 'act', 'ac']],
  ['Romans', ['romans', 'rom', 'ro', 'rm']],
  ['1 Corinthians', ['1 corinthians', '1corinthians', '1 cor', '1cor', 'i corinthians', 'i cor']],
  ['2 Corinthians', ['2 corinthians', '2corinthians', '2 cor', '2cor', 'ii corinthians', 'ii cor']],
  ['Galatians', ['galatians', 'gal', 'ga']],
  ['Ephesians', ['ephesians', 'eph', 'ep']],
  ['Philippians', ['philippians', 'phil', 'php', 'pp']],
  ['Colossians', ['colossians', 'col', 'co']],
  ['1 Thessalonians', ['1 thessalonians', '1thessalonians', '1 thess', '1thess', '1 thes', '1thes', 'i thessalonians']],
  ['2 Thessalonians', ['2 thessalonians', '2thessalonians', '2 thess', '2thess', '2 thes', '2thes', 'ii thessalonians']],
  ['1 Timothy', ['1 timothy', '1timothy', '1 tim', '1tim', 'i timothy', 'i tim']],
  ['2 Timothy', ['2 timothy', '2timothy', '2 tim', '2tim', 'ii timothy', 'ii tim']],
  ['Titus', ['titus', 'tit', 'ti']],
  ['Philemon', ['philemon', 'philem', 'phm', 'pm']],
  ['Hebrews', ['hebrews', 'heb']],
  ['James', ['james', 'jas', 'jm']],
  ['1 Peter', ['1 peter', '1peter', '1 pet', '1pet', '1 pe', '1pe', 'i peter']],
  ['2 Peter', ['2 peter', '2peter', '2 pet', '2pet', '2 pe', '2pe', 'ii peter']],
  ['1 John', ['1 john', '1john', '1 jn', '1jn', 'i john', 'i jn']],
  ['2 John', ['2 john', '2john', '2 jn', '2jn', 'ii john', 'ii jn']],
  ['3 John', ['3 john', '3john', '3 jn', '3jn', 'iii john', 'iii jn']],
  ['Jude', ['jude', 'jud']],
  ['Revelation', ['revelation', 'revelations', 'rev', 're']]
];

const aliasToBook = new Map();
for (const [book, aliases] of BOOKS) {
  for (const alias of aliases) {
    aliasToBook.set(alias, book);
  }
}

const aliasPattern = Array.from(aliasToBook.keys())
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp)
  .join('|');

const referenceRegex = new RegExp(
  `(?:^|\\b)(${aliasPattern})\\.?\\s+(\\d{1,3})(?:\\s*[:.]?\\s+|\\s*[:.]\\s*)(\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?(?=\\b|$)`,
  'i'
);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseScriptureReference(text) {
  const normalized = normalizeText(text);
  const match = normalized.match(referenceRegex);

  if (!match) {
    return null;
  }

  const alias = match[1].toLowerCase().replace(/\.$/, '');
  const book = aliasToBook.get(alias);
  const chapter = Number.parseInt(match[2], 10);
  const verse = Number.parseInt(match[3], 10);
  const endVerse = match[4] ? Number.parseInt(match[4], 10) : null;

  if (!book || chapter < 1 || verse < 1 || (endVerse && endVerse < verse)) {
    return null;
  }

  return {
    book,
    chapter,
    verse,
    endVerse,
    reference: `${book} ${chapter}:${verse}${endVerse ? `-${endVerse}` : ''}`
  };
}

module.exports = {
  parseScriptureReference
};
