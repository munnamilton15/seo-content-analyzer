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
  }

  return false;
}
async function checkLink(url) {
  try {
    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch {
      return {
        url,
        status: 0,
        statusText: "Invalid URL",
        broken: true,
        redirected: false
      };
    }

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return {
        url,
        status: 0,
        statusText: "Unsupported protocol",
        broken: true,
        redirected: false
      };
    }

    if (isPrivateHostname(parsedUrl.hostname)) {
      return {
        url,
        status: 0,
        statusText: "Private URL blocked",
        broken: true,
        redirected: false
      };
    }

    let response;

    try {
      response = await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(8000)
      });
    } catch {
      response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(8000)
      });
    }

    return {
      url,
      status: response.status,
      statusText: response.statusText,
      broken: response.status >= 400,
      redirected:
        response.status >= 300 &&
        response.status < 400
    };
  } catch (error) {
    return {
      url,
      status: 0,
      statusText: "Request failed",
      broken: true,
      redirected: false,
      error: error.message
    };
  }
}

async function checkLinks(links) {
  const uniqueLinks = [...new Set(links)];

  // Limit the number of links checked
  const linksToCheck = uniqueLinks.slice(0, 50);

  const results = [];

  // Check a few links at a time instead of flooding a server
  const batchSize = 5;

  for (let i = 0; i < linksToCheck.length; i += batchSize) {
    const batch = linksToCheck.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map((link) => checkLink(link))
    );

    results.push(...batchResults);
  }

  return {
    total: results.length,
    working: results.filter((link) => !link.broken && !link.redirected).length,
    broken: results.filter((link) => link.broken).length,
    redirected: results.filter((link) => link.redirected).length,
    results
  };
}

module.exports = checkLinks;