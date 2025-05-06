const axios = require('axios');

async function checkSafeBrowsing(url) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn("Google API Key missing");
    return {
      isSafe: true,
      reasons: ["Safe Browsing check skipped: No API key"]
    };
  }

  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        client: {
          clientId: "suspick-app",
          clientVersion: "1.0"
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }]
        }
      }
    );

    if (response.data && response.data.matches && response.data.matches.length > 0) {
      return {
        isSafe: false,
        reasons: ["Flagged by Google Safe Browsing"]
      };
    }

    return { isSafe: true, reasons: [] };
  } catch (err) {
    console.error("Safe Browsing API error:", err.message);
    return {
      isSafe: true,
      reasons: ["Safe Browsing check failed"]
    };
  }
}

module.exports = { checkSafeBrowsing };
