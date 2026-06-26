const axios = require('axios');
const { parseScriptureReference } = require('../utils/scriptureParser');

const VERSE_OF_THE_DAY_REFERENCES = [
  'John 3:16',
  'Psalm 23:1',
  'Romans 8:28',
  'Philippians 4:13',
  'Jeremiah 29:11',
  'Proverbs 3:5',
  'Isaiah 41:10',
  'Matthew 6:33',
  'Psalm 119:105',
  '2 Timothy 1:7',
  'Joshua 1:9',
  '1 Peter 5:7'
];

function getApiBaseUrl() {
  return (process.env.BIBLE_API_BASE_URL || 'https://bible-api.com').replace(/\/$/, '');
}

function getTranslation() {
  return process.env.BIBLE_TRANSLATION || 'kjv';
}

function formatVerseResponse(payload, requestedReference) {
  const verses = payload.verses || [];

  if (!verses.length && payload.text) {
    return `*${payload.reference || requestedReference}*\n\n${payload.text.trim()}`;
  }

  const reference = payload.reference || requestedReference;
  const text = verses
    .map((verse) => `${verse.verse}. ${String(verse.text || '').trim()}`)
    .join('\n');

  return [
    `*${reference}*`,
    '',
    text || String(payload.text || '').trim(),
    '',
    `_${getTranslation().toUpperCase()}_`
  ].join('\n').trim();
}

async function lookupVerse(referenceText) {
  const parsed = parseScriptureReference(referenceText);

  if (!parsed) {
    return {
      ok: false,
      message: 'I could not understand that scripture reference. Try: John 3:16'
    };
  }

  try {
    const url = `${getApiBaseUrl()}/${encodeURIComponent(parsed.reference)}`;
    const response = await axios.get(url, {
      params: {
        translation: getTranslation()
      },
      timeout: 12000
    });

    return {
      ok: true,
      reference: parsed.reference,
      message: formatVerseResponse(response.data, parsed.reference)
    };
  } catch (error) {
    const apiMessage = error.response?.data?.error || error.message;
    console.error(`Bible API lookup failed for ${parsed.reference}:`, apiMessage);

    return {
      ok: false,
      message: `I could not fetch ${parsed.reference} right now. Please try again later.`
    };
  }
}

async function getVerseOfTheDay() {
  const reference = VERSE_OF_THE_DAY_REFERENCES[
    Math.floor(Math.random() * VERSE_OF_THE_DAY_REFERENCES.length)
  ];

  return lookupVerse(reference);
}

module.exports = {
  lookupVerse,
  getVerseOfTheDay,
  VERSE_OF_THE_DAY_REFERENCES
};
