import dotenv from 'dotenv';
import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';
import { analyzeHeuristics } from './heuristics.js';
import { checkSafeBrowsing } from './safeBrowsing.js';
import dom from './dom.js';
const { checkDOMFeatures } = dom;

const app = express();
const PORT = 3000;
dotenv.config();

app.use(cors());
app.use(express.json());

const safeDomains = [
  "youtube.com",
  "google.com",
  "github.com",
  "wikipedia.org",
  "microsoft.com"
];

app.post('/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const isWhitelisted = safeDomains.some(domain => hostname.endsWith(domain));

    if (isWhitelisted) {
      return res.json({
        verdict: "safe",
        score: 0,
        reasons: ["Domain is whitelisted as trusted."]
      });
    }

    // ✅ Use Puppeteer instead of Axios to fetch HTML
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/90.0.4430.93 Safari/537.36"
    );
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    const html = await page.content();
    await browser.close();

    // ✅ Run checks
    const heuristics = analyzeHeuristics(html);
    const domCheck = checkDOMFeatures(html);
    const safeBrowsingCheck = await checkSafeBrowsing(url);

    let totalScore = heuristics.score + domCheck.score;
    let verdict = "safe";
    const reasons = [...heuristics.reasons, ...domCheck.reasons, ...safeBrowsingCheck.reasons];

    if (!safeBrowsingCheck.isSafe || totalScore >= 5) {
      verdict = "suspicious";
    }

    res.json({ verdict, score: totalScore, reasons });
  } catch (err) {
    console.error("Error during analysis:", err.message);
    res.status(500).json({ error: "Failed to fetch or analyze site." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ SusPick backend running at http://localhost:${PORT}`);
});
