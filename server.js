const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();
const PORT = process.env.PORT;

// =============================
// مصادر الأخبار (مجانية)
// =============================
const FEEDS = [
  {
    name: "Enterprise – Retail",
    url: "https://enterprise.press/category/retail/feed/"
  },
  {
    name: "Egypt Today – Business",
    url: "https://www.egypttoday.com/rss.aspx?cat=business"
  },
  {
    name: "Daily News Egypt – Retail",
    url: "https://dailynewsegypt.com/category/business/retail/feed/"
  },
  {
    name: "Daily News Egypt – Economy",
    url: "https://dailynewsegypt.com/category/business/economy/feed/"
  }
];

// كلمات مفتاحية للفلترة (FMCG + أسعار)
const KEYWORDS = [
  "price",
  "prices",
  "increase",
  "fmcg",
  "retail",
  "consumer",
  "inflation",
  "gold",
  "steel",
  "cement",
  "coca",
  "pepsi",
  "chipsy",
  "edita",
  "tobacco",
  "mansour",
  "jti"
];

// =============================
// جلب وتجميع الأخبار
// =============================
async function getAllNews() {
  let allNews = [];

  for (const feedSource of FEEDS) {
    try {
      const feed = await parser.parseURL(feedSource.url);

      feed.items.forEach(item => {
        const text =
          (item.title + " " + (item.contentSnippet || ""))
            .toLowerCase();

        const matched = KEYWORDS.some(keyword =>
          text.includes(keyword)
        );

        if (matched) {
          allNews.push({
            title: item.title,
            link: item.link,
            source: feedSource.name,
            date: item.pubDate || ""
          });
        }
      });
    } catch (error) {
      console.log("❌ Error loading feed:", feedSource.name);
    }
  }

  // إزالة التكرار
  const uniqueNews = [];
  const titles = new Set();

  for (const news of allNews) {
    if (!titles.has(news.title)) {
      titles.add(news.title);
      uniqueNews.push(news);
    }
  }

  return uniqueNews.slice(0, 25);
}

// =============================
// Endpoints
// =============================

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("✅ FMCG API is running successfully");
});

// API الأخبار
app.get("/api/data", async (req, res) => {
  try {
    const news = await getAllNews();

    res.json({
      status: "success",
      lastUpdate: new Date().toISOString(),
      count: news.length,
      news: news
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to load news"
    });
  }
});

app.listen(PORT, () => {
  console.log("✅ Server listening on port", PORT);
});
