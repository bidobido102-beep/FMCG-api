const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const cron = require("node-cron");
const Parser = require("rss-parser");
const express = require("express");

const app = express();
const parser = new Parser();
const DATA_FILE = "data.json";
const PORT = process.env.PORT || 3000;

// ================== Helpers ==================
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log("✅ Updated:", new Date().toLocaleString());
}

// ================== Prices ==================
async function getGoldPrice() {
  try {
    const res = await axios.get("https://www.goldpricez.com/eg/gold-rates");
    const $ = cheerio.load(res.data);
    return $("table tr").eq(1).find("td").eq(1).text().trim() || "غير متاح";
  } catch {
    return "غير متاح";
  }
}

async function getSteelPrice() {
  return "42000 جنيه / طن";
}

async function getCementPrice() {
  return "2100 جنيه / طن";
}

// ================== News ==================
async function getFMCGNews() {
  const feeds = [
    "https://enterprise.press/category/retail/feed/",
    "https://www.egypttoday.com/rss.aspx?cat=business",
    "https://dailynewsegypt.com/category/business/retail/feed/"
  ];

  let news = [];

  for (let url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      feed.items.slice(0, 5).forEach(item => {
        const text = (item.title + item.contentSnippet).toLowerCase();
        if (
          text.includes("price") ||
          text.includes("retail") ||
          text.includes("fmcg") ||
          text.includes("consumer") ||
          text.includes("coca") ||
          text.includes("pepsi") ||
          text.includes("edit") ||
          text.includes("tobacco")
        ) {
          news.push({
            title: item.title,
            link: item.link,
            source: feed.title,
            date: item.pubDate || new Date().toDateString()
          });
        }
      });
    } catch (e) {
      console.log("RSS error:", url);
    }
  }

  return news.slice(0, 8);
}

// ================== Update ==================
async function updateAll() {
  const data = {
    lastUpdate: new Date().toISOString(),
    prices: {
      gold: await getGoldPrice(),
      steel: await getSteelPrice(),
      cement: await getCementPrice()
    },
    news: await getFMCGNews()
  };

  saveData(data);
}

updateAll();
cron.schedule("0 * * * *", updateAll);

// ================== API ==================
app.get("/api/data", (req, res) => {
  if (fs.existsSync(DATA_FILE)) {
    res.json(JSON.parse(fs.readFileSync(DATA_FILE)));
  } else {
    res.json({ error: "No data yet" });
  }
});

app.listen(PORT, () => {
  console.log("🚀 Server running on", PORT);
});
