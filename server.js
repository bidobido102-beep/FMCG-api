const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const cron = require("node-cron");
const Parser = require("rss-parser");

const parser = new Parser();
const DATA_FILE = "data.json";

// كتابة البيانات
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log("✅ Updated:", new Date().toLocaleString());
}

// 🥇 سعر الذهب
async function getGoldPrice() {
  try {
    const res = await axios.get("https://www.goldpricez.com/eg/gold-rates");
    const $ = cheerio.load(res.data);
    const price = $("table tr").eq(1).find("td").eq(1).text().trim();
    return price || "غير متاح";
  } catch {
    return "غير متاح";
  }
}

// 🏗️ أسعار تقريبية (ثابتة كبداية)
async function getSteelPrice() {
  return "42000 جنيه / طن";
}

async function getCementPrice() {
  return "2100 جنيه / طن";
}

// 📰 أخبار FMCG حقيقية (RSS)
async function getFMCGNews() {
  const feeds = [
    "https://www.egypttoday.com/rss.aspx?cat=business",
    "https://dailynewsegypt.com/category/business/retail/feed/",
    "https://enterprise.press/category/retail/feed/"
  ];

  let news = [];

  for (let url of feeds) {
    try {
      const feed = await parser.parseURL(url);

      feed.items.slice(0, 5).forEach(item => {
        const text = (item.title + " " + item.contentSnippet).toLowerCase();

        if (
          text.includes("price") ||
          text.includes("prices") ||
          text.includes("fmcg") ||
          text.includes("retail") ||
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

    } catch (err) {
      console.log("❌ RSS error:", url);
    }
  }

  return news.slice(0, 8);
}

// تحديث كل شيء
async function updateAll() {
  const data = {
    lastUpdate: new Date().toISOString(),
    prices: {
      gold: await getGoldPrice(),
      steel: await getSteelPrice(),
      cement: await getCementPrice()
    },
    companies: [
      "Coca-Cola",
      "Pepsi",
      "Chipsy",
      "Edita",
      "Eastern Company",
      "Al Mansour",
      "JTI"
    ],
    news: await getFMCGNews()
  };

  saveData(data);
}

// تشغيل أول مرة
updateAll();

// تحديث كل ساعة ⏰
cron.schedule("0 * * * *", () => {
  updateAll();
});
