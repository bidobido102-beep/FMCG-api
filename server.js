const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();
const PORT = process.env.PORT;

// ======================
// أسعار حقيقية (مبسطة)
// ======================
function getPrices() {
  return {
    gold: {
      "24": "4650 جنيه",
      "21": "4060 جنيه",
      "18": "3480 جنيه",
      coin: "32800 جنيه"
    },
    steel: "41000 – 42000 جنيه / طن",
    cement: "2000 – 2150 جنيه / طن",
    lastUpdate: new Date().toLocaleDateString("ar-EG")
  };
}

// ======================
// أخبار FMCG (زي قبل)
// ======================
const FEEDS = [
  "https://enterprise.press/category/retail/feed/",
  "https://dailynewsegypt.com/category/business/retail/feed/"
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
          date: item.pubDate || ""
        });
      });
    } catch {}
  }
  return news.slice(0, 20);
}

// ======================
// Routes
// ======================
app.get("/", (req, res) => {
  res.send("✅ FMCG API running");
});

app.get("/api/data", async (req, res) => {
  res.json({
    prices: getPrices(),
    news: await getNews()
  });
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
