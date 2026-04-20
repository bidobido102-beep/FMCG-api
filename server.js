const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 8080;

/* ===== CORS ===== */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

/* ===== Companies to Track ===== */
const COMPANIES = [
  { name: "Coca-Cola", keys: ["coca", "coke"] },
  { name: "Pepsi", keys: ["pepsi"] },
  { name: "Chipsy", keys: ["chipsy"] },
  { name: "Edita", keys: ["edita"] },
  { name: "Eastern Company", keys: ["tobacco", "eastern"] },
  { name: "Al Mansour", keys: ["mansour"] },
  { name: "JTI", keys: ["jti"] }
];

/* ===== News Sources ===== */
const FEEDS = [
  "https://enterprise.press/category/retail/feed/",
  "https://dailynewsegypt.com/category/business/retail/feed/",
  "https://dailynewsegypt.com/category/business/economy/feed/"
];

/* ===== Simple Summary (Nabd‑style) ===== */
function summarize(text) {
  if (!text) return "";
  const sentences = text.split(". ");
  return sentences.slice(0, 2).join(". ") + ".";
}

/* ===== Price Impact Detection ===== */
function detectPriceImpact(text) {
  return /price|prices|increase|rise|cost|hike/i.test(text);
}

/* ===== Fetch & Process News ===== */
async function getNews() {
  let news = [];

  for (let url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);

      feed.items.forEach(item => {
        const content =
          (item.title + " " + (item.contentSnippet || "")).toLowerCase();

        let company = null;
        COMPANIES.forEach(c => {
          if (c.keys.some(k => content.includes(k))) {
            company = c.name;
          }
        });

        const priceImpact = detectPriceImpact(content);

        news.push({
          title: item.title,
          summary: summarize(item.contentSnippet),
          link: item.link,
          source: feed.title,
          company: company,
          priceImpact: priceImpact
        });
      });

    } catch (e) {
      console.log("Feed error:", url);
    }
  }

  // Remove duplicates
  const seen = new Set();
  return news.filter(n => {
    if (seen.has(n.title)) return false;
    seen.add(n.title);
    return true;
  }).slice(0, 30);
}

/* ===== API ===== */
app.get("/", (req, res) => {
  res.send("✅ FMCG Nabd‑Like API is running");
});

app.get("/api/data", async (req, res) => {
  res.json({
    updated: new Date().toLocaleString("ar-EG"),
    news: await getNews()
  });
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
