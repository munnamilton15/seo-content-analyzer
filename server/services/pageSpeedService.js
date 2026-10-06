const PAGE_SPEED_API =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

async function analyzePageSpeed(url) {
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey) {
    throw new Error("PageSpeed API key is not configured.");
  }

  const apiUrl =
    `${PAGE_SPEED_API}?url=${encodeURIComponent(url)}` +
    `&strategy=mobile` +
    `&category=performance` +
    `&category=accessibility` +
    `&category=best-practices` +
    `&category=seo` +
    `&key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(apiUrl, {
  signal: AbortSignal.timeout(30000)
});

  if (!response.ok) {
    const errorText = await response.text();

    console.error("PageSpeed API error:");
    console.error("Status:", response.status);
    console.error("Response:", errorText);

    throw new Error(
      `PageSpeed API returned ${response.status}`
    );
  }

  const data = await response.json();

  const lighthouse = data.lighthouseResult;

  if (!lighthouse) {
    throw new Error("PageSpeed returned no Lighthouse result.");
  }

  const categories = lighthouse.categories || {};
  const audits = lighthouse.audits || {};

  return {
    performance: categories.performance?.score != null
      ? Math.round(categories.performance.score * 100)
      : null,

    accessibility: categories.accessibility?.score != null
      ? Math.round(categories.accessibility.score * 100)
      : null,

    bestPractices: categories["best-practices"]?.score != null
      ? Math.round(categories["best-practices"].score * 100)
      : null,

    seo: categories.seo?.score != null
      ? Math.round(categories.seo.score * 100)
      : null,

    metrics: {
      firstContentfulPaint:
        audits["first-contentful-paint"]?.displayValue || "N/A",

      largestContentfulPaint:
        audits["largest-contentful-paint"]?.displayValue || "N/A",

      speedIndex:
        audits["speed-index"]?.displayValue || "N/A",

      totalBlockingTime:
        audits["total-blocking-time"]?.displayValue || "N/A",

      cumulativeLayoutShift:
        audits["cumulative-layout-shift"]?.displayValue || "N/A"
    }
  };
}

module.exports = analyzePageSpeed;