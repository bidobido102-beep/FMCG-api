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

/* ===== شركات نتابعها ===== */
const COMPANIES = [
  { name: "Coca-Cola", keys: ["coca", "coke"] },
  { name: "Pepsi", keys: ["pepsi"] },
  { name: "Edita", keys: ["edita"] },
  { name: "Chipsy", keys: ["chipsy"] },
  { name: "Eastern Company", keys: ["tobacco", "eastern"] }
];

/* ===== مصادر أخبار ===== */
const FEEDS = [
  "https://enterprise.press/category/retail/feed/",
  "https://dailynewsegypt.com/category/business/retail/feed/",
  "https://dailynewsegypt.com/category/business/economy/feed/"
];

/* ===== تلخيص بسيط ===== */
function summarize(text) {
  if (!text) return "";
  const sentences = text.split(". ");
  return sentences.slice(0, 2).join(". ") + ".";
}

/* ===== جلب الأخبار ===== */
async function fetchNews() {
  let result = [];

  for (let url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);

      feed.items.forEach(item => {
        const fullText =
          (item.title + " " + (item.contentSnippet || "")).toLowerCase();

        let company = null;
        COMPANIES.forEach(c => {
          if (c.keys.some(k => fullText.includes(k))) {
            company = c.name;
          }
        });

        const priceImpact =
          /price|increase|rise|cost|hike/.test(fullText);

        result.push({
          title: item.title,
          summary: summarize(item.contentSnippet),
          source: feed.title,
          link: item.link,
          company: company,
          priceImpact: priceImpact
        });
      });
    } catch {}
  }

  return result.slice(0, 30);
}

/* ===== API ===== */
app.get("/api/data", async (req, res) => {
  const news = await fetchNews();

  res.json({
    updated: new Date().toLocaleString("ar-EG"),
    news: news
  });
});

app.get("/", (req, res) => {
  res.send("✅ FMCG Nabd-like API running");
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
