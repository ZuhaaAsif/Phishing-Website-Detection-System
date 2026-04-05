import tldts from "tldts";

export function extractDomain(url) {
  return tldts.getDomain(url);
}

// Basic typosquatting detection: Levenshtein distance measure
import levenshtein from "fast-levenshtein";

const trustedBrands = ["google.com", "paypal.com", "microsoft.com", "amazon.com"];

export function checkLookalikeDomain(domain) {
  let suspicious = false;
  const similarities = trustedBrands.map((brand) => ({
    brand,
    distance: levenshtein.get(brand, domain),
  }));

  const closest = similarities.reduce((a, b) => (a.distance < b.distance ? a : b));
  if (closest.distance < 3 && !trustedBrands.includes(domain)) suspicious = true;

  return { suspicious, closest };
}

// WHOIS externel API for domain age
export async function domainAgeCheck(domain) {
  const res = await fetch(`[api.api-ninjas.com](https://api.api-ninjas.com/v1/whois?domain=${domain})`, {
    headers: { "X-Api-Key": process.env.NINJA_API_KEY },
  });
  const data = await res.json();

  const created = new Date(data.creation_date || data.created_date);
  const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);

  return { days: ageDays };
}

// google safe browsing API
export async function checkGoogleSafeBrowsing(url) {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_KEY;

  const res = await fetch(
    `[safebrowsing.googleapis.com](https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey})`,
    {
      method: "POST",
      body: JSON.stringify({
        client: { clientId: "your-app", clientVersion: "1.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      }),
      headers: { "Content-Type": "application/json" },
    }
  );

  const data = await res.json();
  const malicious = data?.matches?.length > 0;
  return { malicious, matches: data.matches || [] };
}