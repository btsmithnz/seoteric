import { tool } from "ai";
import { load } from "cheerio";
import { z } from "zod";

interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  automatedReadabilityIndex: number;
  recommendation: string;
}

interface ContentIssues {
  isThinContent: boolean;
  hasKeywordStuffing: boolean;
  duplicateParagraphs: string[];
  missingElements: string[];
}

interface ContentQualityResult {
  url: string;
  wordCount: number;
  readability: ReadabilityMetrics;
  contentIssues: ContentIssues;
  textToHtmlRatio: number;
  paragraphCount: number;
  averageSentenceLength: number;
}

const THIN_CONTENT_THRESHOLD = 300;
const KEYWORD_STUFFING_THRESHOLD = 0.03; // 3% of total words

// Common syllable patterns for English
const SYLLABLE_PATTERNS = {
  subtract: [
    /cial/,
    /tia/,
    /cius/,
    /cious/,
    /giu/,
    /ion/,
    /iou/,
    /sia$/,
    /eous$/,
    /[^aeiou]ely$/,
    /[aeiouy]ed$/,
  ],
  add: [
    /ia/,
    /riet/,
    /dien/,
    /iu/,
    /io/,
    /ii/,
    /[aeiouym]bl$/,
    /[aeiou]{3}/,
    /^mc/,
    /ism$/,
    /([^aeiouy])\1l$/,
    /[^l]lien/,
    /^coa[dglx]./,
    /[^gq]ua[^auieo]/,
    /dnt$/,
  ],
};

function countSyllables(word: string): number {
  const lowerWord = word.toLowerCase().replace(/[^a-z]/g, "");
  if (lowerWord.length <= 3) {
    return 1;
  }

  // Count vowel groups
  const vowelGroups = lowerWord.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Apply pattern adjustments
  for (const pattern of SYLLABLE_PATTERNS.subtract) {
    if (pattern.test(lowerWord)) {
      count--;
    }
  }
  for (const pattern of SYLLABLE_PATTERNS.add) {
    if (pattern.test(lowerWord)) {
      count++;
    }
  }

  // Handle silent e
  if (lowerWord.endsWith("e") && !lowerWord.endsWith("le")) {
    count--;
  }

  return Math.max(1, count);
}

const SENTENCE_REGEX = /[.!?]+/;
const WORD_REGEX = /\b[a-zA-Z]+\b/g;
const SPACE_REGEX = /\s+/;

function calculateReadability(text: string): ReadabilityMetrics {
  const sentences = text
    .split(SENTENCE_REGEX)
    .filter((s) => s.trim().length > 0);
  const words = text.match(WORD_REGEX) || [];

  if (words.length === 0 || sentences.length === 0) {
    return {
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      automatedReadabilityIndex: 0,
      recommendation:
        "Unable to calculate readability - insufficient text content",
    };
  }

  const totalSyllables = words.reduce(
    (sum, word) => sum + countSyllables(word),
    0
  );
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  // Flesch Reading Ease: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
  const fleschReadingEase = Math.round(
    206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  );

  // Flesch-Kincaid Grade Level: 0.39(words/sentences) + 11.8(syllables/words) - 15.59
  const fleschKincaidGrade =
    Math.round(
      (0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59) * 10
    ) / 10;

  // Automated Readability Index: 4.71(characters/words) + 0.5(words/sentences) - 21.43
  const characters = words.join("").length;
  const automatedReadabilityIndex =
    Math.round(
      (4.71 * (characters / words.length) + 0.5 * avgWordsPerSentence - 21.43) *
        10
    ) / 10;

  // Generate recommendation based on Flesch Reading Ease
  let recommendation: string;
  if (fleschReadingEase >= 90) {
    recommendation =
      "Very easy to read. Suitable for 5th grade students. Consider if this matches your target audience.";
  } else if (fleschReadingEase >= 80) {
    recommendation =
      "Easy to read. Conversational English. Good for general audiences.";
  } else if (fleschReadingEase >= 70) {
    recommendation =
      "Fairly easy to read. Good readability for most web content.";
  } else if (fleschReadingEase >= 60) {
    recommendation = "Standard readability. Suitable for 8th-9th grade level.";
  } else if (fleschReadingEase >= 50) {
    recommendation =
      "Fairly difficult. Consider simplifying for broader audiences.";
  } else if (fleschReadingEase >= 30) {
    recommendation =
      "Difficult. Best suited for academic or professional audiences.";
  } else {
    recommendation =
      "Very difficult to read. Consider breaking up complex sentences and using simpler words.";
  }

  return {
    fleschReadingEase: Math.max(0, Math.min(100, fleschReadingEase)),
    fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
    automatedReadabilityIndex: Math.max(0, automatedReadabilityIndex),
    recommendation,
  };
}

function detectKeywordStuffing(words: string[]): boolean {
  if (words.length < 100) {
    return false; // Not enough words to reliably detect
  }

  const wordFreq = new Map<string, number>();
  for (const word of words) {
    const lower = word.toLowerCase();
    wordFreq.set(lower, (wordFreq.get(lower) || 0) + 1);
  }

  // Check if any word appears more than threshold percentage
  for (const [, count] of wordFreq) {
    if (count / words.length > KEYWORD_STUFFING_THRESHOLD) {
      return true;
    }
  }

  return false;
}

function findDuplicateParagraphs(paragraphs: string[]): string[] {
  const seen = new Map<string, number>();
  const duplicates: string[] = [];

  for (const p of paragraphs) {
    const normalized = p.trim().toLowerCase();
    if (normalized.length < 50) {
      continue; // Skip short paragraphs
    }

    const count = seen.get(normalized) || 0;
    if (count === 1) {
      // Second occurrence, add to duplicates
      duplicates.push(p.slice(0, 100) + (p.length > 100 ? "..." : ""));
    }
    seen.set(normalized, count + 1);
  }

  return duplicates;
}

function detectMissingElements($: ReturnType<typeof load>): string[] {
  const missing: string[] = [];

  if ($("h1").length === 0) {
    missing.push("No H1 heading found");
  }
  if ($("h1").length > 1) {
    missing.push("Multiple H1 headings found (recommend only one)");
  }
  if ($("h2").length === 0) {
    missing.push(
      "No H2 headings found - consider adding subheadings for structure"
    );
  }
  if ($("img").length === 0) {
    missing.push("No images found - consider adding visual content");
  }
  if ($("a").length === 0) {
    missing.push("No links found - consider adding internal or external links");
  }
  if ($("ul, ol").length === 0 && $("p").length > 3) {
    missing.push(
      "No lists found - consider using bullet points for scannability"
    );
  }

  return missing;
}

export const analyzeContentQualityTool = tool({
  description:
    "Analyze content quality metrics including readability scores, word count, thin content detection, keyword stuffing, and structural elements.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to analyze content quality for"),
  }),
  execute: async ({
    url,
  }): Promise<ContentQualityResult | { error: string }> => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        return { error: `Failed to fetch page: HTTP ${response.status}` };
      }

      const html = await response.text();
      const $ = load(html);

      // Remove script, style, and non-content elements
      $("script, style, noscript, nav, header, footer, aside").remove();

      // Extract text content
      const bodyText = $("body").text();
      const cleanText = bodyText.replace(SPACE_REGEX, " ").trim();
      const words = cleanText.match(WORD_REGEX) || [];

      // Calculate text-to-HTML ratio
      const textLength = cleanText.length;
      const htmlLength = html.length;
      const textToHtmlRatio =
        Math.round((textLength / htmlLength) * 100 * 10) / 10;

      // Get paragraphs
      const paragraphs = $("p")
        .map((_, el) => $(el).text().trim())
        .get()
        .filter((p) => p.length > 0);

      // Calculate average sentence length
      const sentences = cleanText
        .split(SENTENCE_REGEX)
        .filter((s) => s.trim().length > 0);
      const averageSentenceLength =
        sentences.length > 0
          ? Math.round((words.length / sentences.length) * 10) / 10
          : 0;

      // Calculate readability
      const readability = calculateReadability(cleanText);

      // Detect content issues
      const contentIssues: ContentIssues = {
        isThinContent: words.length < THIN_CONTENT_THRESHOLD,
        hasKeywordStuffing: detectKeywordStuffing(words),
        duplicateParagraphs: findDuplicateParagraphs(paragraphs),
        missingElements: detectMissingElements($),
      };

      return {
        url,
        wordCount: words.length,
        readability,
        contentIssues,
        textToHtmlRatio,
        paragraphCount: paragraphs.length,
        averageSentenceLength,
      };
    } catch (error) {
      return {
        error: `Error analyzing content quality: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
