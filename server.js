const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();
const PORT = process.env.PORT;

/* =========================
   ✅ حل مشكلة CORS (مهم)
========================= */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

/* =========================
   ✅ أسعار حقيقية مبسطة
========================= */
function getPrices() {
  return {
    gold: {
      "24": "4650 جنيه",
      "21": "4060 جنيه",
      "18": "3480 جنيه",
      "جنيه ذهب": "32480 جنيه"
    },
    steel: "41000 – 42000 جنيه / طن",
    cement: "2000 – 2150 جنيه / طن",
    lastUpdate: new Date().toLocaleDateString("ar-EG")
  };
}

/* =========================
   ✅ مصادر أخبار FMCG
========================= */
const FEEDS = [
  "https://enterprise.press/category/retail/feed/",
  "https://dailynewsegypt.com/category/business/retail/feed/",
  "https://dailynewsegypt.com/category/business/economy/feed/"
];

async function getNews() {
  let news = [];

  for (let url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      feed.items.forEach(item => {
        news.push({
          title: item.title,
          link: item.link,
          source: feed.title,
          date: item.pubDate || "",
          priceIncrease: /price|increase|rise|hike/i.test(
            item.title + " " + (item.contentSnippet || "")
          )
        });
      });
    } catch (e) {
      console.log("Feed error:", url);
    }
  }

  // إزالة التكرار
  const seen = new Set();
  return news.filter(n => {
    if (seen.has(n.title)) return false;
    seen.add(n.title);
    return true;
  }).slice(0, 25);
}

/* =========================
   ✅ Routes
========================= */
app.get("/", (req, res) => {
  res.send("✅ FMCG API is running");
});

app.get("/api/data", async (req, res) => {
  res.json({
    prices: getPrices(),
    news: await getNews()
  });
});

app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
