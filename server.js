const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 8080;

/* =========================
   ✅ حل CORS نهائي
========================= */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

/* =========================
   ✅ أسعار سوق (صادقة)
========================= */
function getPrices() {
  return {
    gold: {
      trend: "↗ ارتفاع",
      note: "الأسعار تختلف حسب الصاغة والمصنعية",
      source: "تقارير السوق المحلية"
    },
    steel: {
      trend: "↗ زيادة",
      note: "أسعار شركات الحديد الكبرى في مصر"
    },
    cement: {
      trend: "→ استقرار",
      note: "متوسط أسعار المصانع"
    },
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

const KEYWORDS = [
  "price",
  "prices",
  "increase",
  "fmcg",
  "retail",
  "consumer",
  "coca",
  "pepsi",
  "chipsy",
  "edita",
  "tobacco",
  "mansour",
  "market"
];

async function getNews() {
  let news = [];

  for (let url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);

      feed.items.forEach(item => {
        const text = (
          item.title + " " + (item.contentSnippet || "")
        ).toLowerCase();

        if (KEYWORDS.some(k => text.includes(k))) {
          news.push({
            title: item.title,
            link: item.link,
            source: feed.title,
            date: item.pubDate || "",
            priceIncrease:
              text.includes("price") ||
              text.includes("increase") ||
              text.includes("rise")
          });
        }
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
  }).slice(0, 30);
}

/* =========================
   ✅ API Routes
========================= */
app.get("/", (req, res) => {
  res.send("✅ FMCG Market Intelligence API running");
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
