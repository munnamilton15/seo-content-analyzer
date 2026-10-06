const analyzePageSpeed = require("../services/pageSpeedService");
const express = require("express");
const rateLimit = require("express-rate-limit");
const dns = require("dns").promises;
const net = require("net");
const analyzeWebsite = require("../services/seoAnalyzer");

const router = express.Router();
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many analysis requests. Please try again later."
  }
});
function isPrivateHostname(hostname) {
  const host = hostname.toLowerCase();

  // Localhost
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1"
  ) {
    return true;
  }

  // IPv4 private/reserved ranges
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

router.post(
  "/analyze",
  analyzeLimiter,
  async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required."
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid URL."
      });
    }

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only HTTP and HTTPS URLs are supported."
      });
    }
if (isPrivateHostname(parsedUrl.hostname)) {
  return res.status(400).json({
    success: false,
    message: "Private or local URLs cannot be analyzed."
  });
}
if (await isPrivateIP(parsedUrl.hostname)) {
  return res.status(400).json({
    success: false,
    message: "Private or local URLs cannot be analyzed."
  });
}
if (parsedUrl.username || parsedUrl.password) {
  return res.status(400).json({
    success: false,
    message: "URLs containing username or password are not supported."
  });
}
if (url.length > 2048) {
  return res.status(400).json({
    success: false,
    message: "URL is too long."
  });
}
   const result = await analyzeWebsite(url);

try {
  const pageSpeed = await analyzePageSpeed(url);
  result.pageSpeed = pageSpeed;
} catch (pageSpeedError) {
  console.error("PageSpeed analysis error:", pageSpeedError);

  result.pageSpeed = {
    available: false,
    message: "PageSpeed data is currently unavailable.",
    performance: null,
    accessibility: null,
    bestPractices: null,
    seo: null,
    metrics: {
      firstContentfulPaint: "N/A",
      largestContentfulPaint: "N/A",
      speedIndex: "N/A",
      totalBlockingTime: "N/A",
      cumulativeLayoutShift: "N/A"
    }
  };
}

    res.json({
      success: true,
      data: result
    });
 } catch (error) {
  console.error("Analysis error:", error);

  res.status(500).json({
    success: false,
    message: "Unable to analyze the website. Please try again."
  });
}
});

module.exports = router;
