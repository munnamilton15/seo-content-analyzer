const dns = require("dns").promises;
const net = require("net");
const checkLinks = require("./linkChecker");
const cheerio = require("cheerio");
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");

  if (word.length <= 3) {
    return 1;
  }

  const vowels = "aeiouy";
  let syllables = 0;
  let previousWasVowel = false;

  for (const char of word) {
    const isVowel = vowels.includes(char);

    if (isVowel && !previousWasVowel) {
      syllables++;
    }

    previousWasVowel = isVowel;
  }

  if (
    word.endsWith("e") &&
    syllables > 1
  ) {
    syllables--;
  }

  return Math.max(1, syllables);
}
function analyzeReadability(text) {
  const cleanText = text
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) {
    return {
      words: 0,
      sentences: 0,
      paragraphs: 0,
      averageSentenceLength: 0,
      averageParagraphLength: 0,
      score: 0
    };
  }

  const words = cleanText
    .split(/\s+/)
    .filter(Boolean);

  const sentences = cleanText
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  let totalSyllables = 0;

  words.forEach((word) => {
    totalSyllables += countSyllables(word);
  });

  const wordCount = words.length;

  const sentenceCount = Math.max(
    sentences.length,
    1
  );

  const paragraphCount = Math.max(
    paragraphs.length,
    1
  );

  const averageSentenceLength =
    wordCount / sentenceCount;

  const averageParagraphLength =
    wordCount / paragraphCount;

  let score =
    206.835 -
    1.015 *
      (wordCount / sentenceCount) -
    84.6 *
      (totalSyllables / wordCount);

  score = Math.max(
    0,
    Math.min(100, score)
  );

  return {
    words: wordCount,
    sentences: sentenceCount,
    paragraphs: paragraphCount,
    averageSentenceLength: Number(
      averageSentenceLength.toFixed(1)
    ),
    averageParagraphLength: Number(
      averageParagraphLength.toFixed(1)
    ),
    score: Number(score.toFixed(1))
  };
}
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "he",
  "her",
  "his",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "its",
  "me",
  "my",
  "of",
  "on",
  "or",
  "our",
  "she",
  "that",
  "the",
  "their",
  "them",
  "there",
  "they",
  "this",
  "to",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "who",
  "will",
  "with",
  "you",
  "your"
]);
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, "");

  if (word.length <= 3) {
    return 1;
  }

  const vowels = "aeiouy";
  let syllables = 0;
  let previousWasVowel = false;

  for (const char of word) {
    const isVowel = vowels.includes(char);

    if (isVowel && !previousWasVowel) {
      syllables++;
    }

    previousWasVowel = isVowel;
  }

  // Silent "e"
  if (
    word.endsWith("e") &&
    syllables > 1
  ) {
    syllables--;
  }

  return Math.max(1, syllables);
}
function analyzeKeywords(text) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const keywordCounts = {};

  words.forEach((word) => {
    if (
      word.length < 3 ||
      STOP_WORDS.has(word) ||
      /^\d+$/.test(word)
    ) {
      return;
    }

    keywordCounts[word] =
      (keywordCounts[word] || 0) + 1;
  });

  const totalWords = words.length;

  const keywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([keyword, count]) => ({
      keyword,
      count,
      density: Number(
        ((count / totalWords) * 100).toFixed(2)
      )
    }));

  return {
    totalWords,
    keywords
  };
}
function isPrivateHostname(hostname) {
  const host = hostname.toLowerCase();

  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1"
  ) {
    return true;
  }

  const parts = host.split(".");

  if (
    parts.length === 4 &&
    parts.every((part) => /^\d+$/.test(part))
  ) {
    const [a, b] = parts.map(Number);

    if (a === 10) return true;

    if (a === 172 && b >= 16 && b <= 31) {
      return true;
    }

    if (a === 192 && b === 168) {
      return true;
    }

    if (a === 169 && b === 254) {
      return true;
    }

    if (a === 127) return true;
  }

  return false;
}

async function isPrivateIP(hostname) {
  try {
    const addresses = await dns.lookup(hostname, {
      all: true
    });

    return addresses.some(({ address }) => {
      if (net.isIPv4(address)) {
        const parts = address.split(".").map(Number);
        const [a, b] = parts;

        return (
          a === 10 ||
          (a === 172 && b >= 16 && b <= 31) ||
          (a === 192 && b === 168) ||
          (a === 169 && b === 254) ||
          a === 127
        );
      }

      if (net.isIPv6(address)) {
        const normalized = address.toLowerCase();

        return (
          normalized === "::1" ||
          normalized.startsWith("fc") ||
          normalized.startsWith("fd") ||
          normalized.startsWith("fe80:")
        );
      }

      return false;
    });
  } catch {
    return true;
  }
}
async function analyzeWebsite(url) {
let currentUrl = url;
let response;

const MAX_REDIRECTS = 5;

for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
  const parsedUrl = new URL(currentUrl);

  if (
    parsedUrl.protocol !== "http:" &&
    parsedUrl.protocol !== "https:"
  ) {
    throw new Error("Unsupported redirect protocol.");
  }

  if (isPrivateHostname(parsedUrl.hostname)) {
    throw new Error("Redirect to a private or local URL was blocked.");
  }

  if (await isPrivateIP(parsedUrl.hostname)) {
    throw new Error("Redirect to a private or local IP was blocked.");
  }

  response = await fetch(currentUrl, {
    redirect: "manual",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; SEOContentAnalyzer/1.0)"
    },
    signal: AbortSignal.timeout(15000)
  });

  if (
    response.status >= 300 &&
    response.status < 400
  ) {
    const location = response.headers.get("location");

    if (!location) {
      throw new Error("Website returned an invalid redirect.");
    }

    if (redirectCount === MAX_REDIRECTS) {
      throw new Error("Too many redirects.");
    }

    currentUrl = new URL(
      location,
      currentUrl
    ).toString();

    continue;
  }


  break;
}

if (!response.ok) {
  throw new Error(
    `Website returned status ${response.status}`
  );
}

const contentLength = response.headers.get("content-length");

const MAX_HTML_SIZE = 5 * 1024 * 1024; // 5 MB

if (contentLength && Number(contentLength) > MAX_HTML_SIZE) {
  throw new Error("Webpage is too large to analyze.");
}

const html = await response.text();

if (Buffer.byteLength(html, "utf8") > MAX_HTML_SIZE) {
  throw new Error("Webpage is too large to analyze.");
}

  const $ = cheerio.load(html);
  const websiteUrl = new URL(url);
const origin = `${websiteUrl.protocol}//${websiteUrl.host}`;
const robotsUrl = `${origin}/robots.txt`;

let robotsExists = false;
let sitemapExists = false;
let sitemapUrlFound = "";

try {
  const robotsResponse = await fetch(robotsUrl, {
    signal: AbortSignal.timeout(10000)
  });

  if (robotsResponse.ok) {
    robotsExists = true;

    const robotsText = await robotsResponse.text();

    const sitemapMatch = robotsText.match(
      /^Sitemap:\s*(.+)$/im
    );

    if (sitemapMatch) {
      sitemapUrlFound = sitemapMatch[1].trim();
    }
  }
} catch {
  robotsExists = false;
}

const viewport = $('meta[name="viewport"]').attr("content") || "";
const robotsMeta = $('meta[name="robots"]').attr("content") || "";

const language = $("html").attr("lang") || "";

const openGraph = {
  title: $('meta[property="og:title"]').attr("content") || "",
  description:
    $('meta[property="og:description"]').attr("content") || "",
  image: $('meta[property="og:image"]').attr("content") || "",
  url: $('meta[property="og:url"]').attr("content") || ""
};

const structuredData = $('script[type="application/ld+json"]').length > 0;

  // Title
  const title = $("title").first().text().trim();

  // Meta description
  const metaDescription =
    $('meta[name="description"]')
      .attr("content")
      ?.trim() || "";

  // Headings
  const h1 = $("h1")
    .map((_, element) => $(element).text().trim())
    .get();

  const h2 = $("h2")
    .map((_, element) => $(element).text().trim())
    .get();

  const h3 = $("h3")
    .map((_, element) => $(element).text().trim())
    .get();

  // Body text
  const bodyText = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const words = bodyText
    .split(/\s+/)
    .filter(Boolean);

  const wordCount = words.length;
  const keywordAnalysis =
  analyzeKeywords(bodyText);
  const readability =
  analyzeReadability(bodyText);

  // Images
  const images = $("img")
    .map((_, element) => ({
      src: $(element).attr("src") || "",
      alt: $(element).attr("alt") || ""
    }))
    .get();

  const imagesWithoutAlt = images.filter(
    (image) => image.alt.trim() === ""
  );

  // Links
  const links = $("a")
    .map((_, element) => ({
      href: $(element).attr("href") || "",
      text: $(element).text().trim()
    }))
    .get()
    .filter((link) => link.href);

  const baseUrl = new URL(url);

  let internalLinks = [];
  let externalLinks = [];

  links.forEach((link) => {
    try {
      const linkUrl = new URL(link.href, url);

      if (linkUrl.hostname === baseUrl.hostname) {
        internalLinks.push(linkUrl.href);
      } else {
        externalLinks.push(linkUrl.href);
      }
    } catch {
      // Ignore invalid links
    }
  });

  // Canonical
  const canonical =
    $('link[rel="canonical"]')
      .attr("href") || "";

  // HTTPS
  const httpsEnabled =
    baseUrl.protocol === "https:";
    const linkCheck = await checkLinks(
  links
    .map((link) => link.href)
    .filter(Boolean)
);
const scores = calculateScores({
  title,
  metaDescription,
  h1,
  h2,
  h3,
  wordCount,
  images,
  imagesWithoutAlt,
  canonical,
  httpsEnabled,
  keywordAnalysis
});
  // Issues
 // -----------------------------
// SEO Issues & Recommendations
// -----------------------------

const issues = [];

// Title
if (!title) {
  issues.push({
    type: "error",
    category: "Title",
    message: "Title tag is missing.",
    recommendation:
      "Add a unique and descriptive title between 30 and 60 characters."
  });
} else {
  if (title.length < 30) {
    issues.push({
      type: "warning",
      category: "Title",
      message: "Title is shorter than 30 characters.",
      recommendation:
        "Make the title more descriptive while keeping it under 60 characters."
    });
  }

  if (title.length > 60) {
    issues.push({
      type: "warning",
      category: "Title",
      message: "Title is longer than 60 characters.",
      recommendation:
        "Shorten the title to reduce the chance of it being truncated in search results."
    });
  }
}

// Meta Description
if (!metaDescription) {
  issues.push({
    type: "error",
    category: "Meta Description",
    message: "Meta description is missing.",
    recommendation:
      "Add a unique meta description describing the page content."
  });
} else {
  if (metaDescription.length < 70) {
    issues.push({
      type: "warning",
      category: "Meta Description",
      message: "Meta description is shorter than 70 characters.",
      recommendation:
        "Add more useful information while keeping the description concise."
    });
  }

  if (metaDescription.length > 160) {
    issues.push({
      type: "warning",
      category: "Meta Description",
      message: "Meta description is longer than 160 characters.",
      recommendation:
        "Shorten the description to reduce truncation in search results."
    });
  }
}

// H1
if (h1.length === 0) {
  issues.push({
    type: "error",
    category: "Headings",
    message: "No H1 heading found.",
    recommendation:
      "Add one clear H1 heading that describes the main topic of the page."
  });
}

if (h1.length > 1) {
  issues.push({
    type: "warning",
    category: "Headings",
    message: `Found ${h1.length} H1 headings.`,
    recommendation:
      "Review the H1 structure and ensure the page has a clear primary heading."
  });
}

// Content
if (wordCount < 300) {
  issues.push({
    type: "warning",
    category: "Content",
    message: "Page contains less than 300 words.",
    recommendation:
      "Consider adding useful, relevant content where appropriate."
  });
}

// Images
if (imagesWithoutAlt.length > 0) {
  issues.push({
    type: "warning",
    category: "Images",
    message: `${imagesWithoutAlt.length} image(s) are missing alt text.`,
    recommendation:
      "Add descriptive alt text to meaningful images."
  });
}

// Canonical
if (!canonical) {
  issues.push({
    type: "warning",
    category: "Technical SEO",
    message: "Canonical URL is missing.",
    recommendation:
      "Add a canonical link element to identify the preferred URL."
  });
}

// HTTPS
if (!httpsEnabled) {
  issues.push({
    type: "error",
    category: "Security",
    message: "Website is not using HTTPS.",
    recommendation:
      "Configure HTTPS and redirect HTTP traffic to the secure version."
  });
}

// Viewport
if (!viewport) {
  issues.push({
    type: "warning",
    category: "Mobile SEO",
    message: "Viewport meta tag is missing.",
    recommendation:
      "Add a responsive viewport meta tag for mobile devices."
  });
}

// Language
if (!language) {
  issues.push({
    type: "warning",
    category: "Technical SEO",
    message: "HTML language attribute is missing.",
    recommendation:
      'Add a valid lang attribute to the <html> element, such as lang="en".'
  });
}

// Robots.txt
if (!robotsExists) {
  issues.push({
    type: "warning",
    category: "Technical SEO",
    message: "robots.txt file was not found.",
    recommendation:
      "Add a robots.txt file if your site needs crawler directives."
  });
}

// Sitemap
if (!sitemapExists) {
  issues.push({
    type: "warning",
    category: "Technical SEO",
    message: "XML sitemap was not found.",
    recommendation:
      "Create an XML sitemap and make it available to search engine crawlers."
  });
}

// Open Graph
if (!openGraph.title) {
  issues.push({
    type: "warning",
    category: "Social SEO",
    message: "Open Graph title is missing.",
    recommendation:
      "Add an og:title tag for better social sharing previews."
  });
}

if (!openGraph.description) {
  issues.push({
    type: "warning",
    category: "Social SEO",
    message: "Open Graph description is missing.",
    recommendation:
      "Add an og:description tag for social sharing previews."
  });
}

if (!openGraph.image) {
  issues.push({
    type: "warning",
    category: "Social SEO",
    message: "Open Graph image is missing.",
    recommendation:
      "Add an og:image tag with a suitable preview image."
  });
}

// Structured Data
if (!structuredData) {
  issues.push({
    type: "warning",
    category: "Structured Data",
    message: "No JSON-LD structured data found.",
    recommendation:
      "Consider adding relevant Schema.org structured data where appropriate."
  });
}

// Readability
if (readability.score < 50) {
  issues.push({
    type: "warning",
    category: "Readability",
    message: `Readability score is low (${readability.score}).`,
    recommendation:
      "Use shorter sentences and simpler language where appropriate."
  });
}

// Links
if (linkCheck.broken > 0) {
  issues.push({
    type: "error",
    category: "Links",
    message: `${linkCheck.broken} broken link(s) detected.`,
    recommendation:
      "Review the broken URLs and update or remove invalid links."
  });
}

if (linkCheck.redirected > 0) {
  issues.push({
    type: "warning",
    category: "Links",
    message: `${linkCheck.redirected} redirected link(s) detected.`,
    recommendation:
      "Where possible, update links to point directly to the final destination."
  });
}
  // -----------------------------
// Professional SEO Scoring
// -----------------------------

function calculateScores({
  title,
  metaDescription,
  h1,
  h2,
  h3,
  wordCount,
  images,
  imagesWithoutAlt,
  canonical,
  httpsEnabled,
  keywordAnalysis
}) {

  // -----------------------------
  // Technical SEO - 20 points
  // -----------------------------

  let technicalScore = 20;

  if (!canonical) {
    technicalScore -= 5;
  }

  if (!httpsEnabled) {
    technicalScore -= 5;
  }

  if (h1.length === 0) {
    technicalScore -= 3;
  }

  if (h2.length === 0) {
    technicalScore -= 2;
  }

  technicalScore = Math.max(
    0,
    technicalScore
  );

  // -----------------------------
  // On-Page SEO - 20 points
  // -----------------------------

  let onPageScore = 20;

  if (!title) {
    onPageScore -= 7;
  } else if (
    title.length < 30 ||
    title.length > 60
  ) {
    onPageScore -= 3;
  }

  if (!metaDescription) {
    onPageScore -= 7;
  } else if (
    metaDescription.length < 70 ||
    metaDescription.length > 160
  ) {
    onPageScore -= 3;
  }

  if (h1.length === 0) {
    onPageScore -= 3;
  }

  if (h1.length > 1) {
    onPageScore -= 2;
  }

  onPageScore = Math.max(
    0,
    onPageScore
  );

  // -----------------------------
  // Content Quality - 20 points
  // -----------------------------

  let contentScore = 20;

  if (wordCount < 300) {
    contentScore -= 8;
  } else if (wordCount < 600) {
    contentScore -= 4;
  }

  if (h2.length === 0) {
    contentScore -= 4;
  }

  if (h3.length === 0) {
    contentScore -= 2;
  }

  contentScore = Math.max(
    0,
    contentScore
  );

  // -----------------------------
  // Keyword Optimization - 20
  // -----------------------------

  let keywordScore = 20;

  const keywords =
    keywordAnalysis.keywords;

  if (keywords.length === 0) {
    keywordScore -= 10;
  }

  if (keywords.length < 5) {
    keywordScore -= 5;
  }

  const hasStrongKeyword =
    keywords.some(
      (keyword) =>
        keyword.density >= 0.5 &&
        keyword.density <= 3
    );

  if (!hasStrongKeyword) {
    keywordScore -= 5;
  }

  keywordScore = Math.max(
    0,
    keywordScore
  );

  // -----------------------------
  // Image SEO - 5 points
  // -----------------------------

  let imageScore = 5;

  if (images.length > 0) {

    const altPercentage =
      images.length === 0
        ? 100
        : (
            (
              images.length -
              imagesWithoutAlt.length
            ) /
            images.length
          ) * 100;

    if (altPercentage < 50) {
      imageScore = 1;
    } else if (altPercentage < 80) {
      imageScore = 3;
    }
  }

  // -----------------------------
  // Security - 5 points
  // -----------------------------

  let securityScore = 5;

  if (!httpsEnabled) {
    securityScore = 0;
  }

  // -----------------------------
  // Total
  // -----------------------------

  const totalScore =
    technicalScore +
    onPageScore +
    contentScore +
    keywordScore +
    imageScore +
    securityScore;

  return {
    total: totalScore,
    technical: technicalScore,
    onPage: onPageScore,
    content: contentScore,
    keywords: keywordScore,
    images: imageScore,
    security: securityScore
  };
}

  return {
     url,
  statusCode: response.status,

  score: scores.total,

  scores: {
    technical: scores.technical,
    onPage: scores.onPage,
    content: scores.content,
    keywords: scores.keywords,
    images: scores.images,
    security: scores.security
  },
    title: {
      text: title,
      length: title.length
    },

    metaDescription: {
      text: metaDescription,
      length: metaDescription.length
    },

    headings: {
      h1,
      h2,
      h3,
      h1Count: h1.length,
      h2Count: h2.length,
      h3Count: h3.length
    },

    content: {
      wordCount,
        readability
    },
    keywords: keywordAnalysis,

    images: {
      total: images.length,
      withoutAlt: imagesWithoutAlt.length,
      details: images
    },

    links: {
      total: links.length,
      internal: internalLinks.length,
      external: externalLinks.length,
      checker: linkCheck
    },

    technical: {
      canonical,
  httpsEnabled,
  robotsTxt: robotsExists,
  sitemap: sitemapExists,
  sitemapUrl: sitemapUrlFound,
  viewport,
  robotsMeta,
  language,
  openGraph,
  structuredData
    },

    issues
  };
}

module.exports = analyzeWebsite;