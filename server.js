const express = require("express");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser();
const PORT = process.env.PORT;

// ===== Sources =====
const FEEDS = [
  { name: "Enterprise Retail", url: "https://enterprise.press/category/retail/feed/" },
  { name: "Egypt Today Business", url: "https://www.egypttoday.com/rss.aspx?cat=business" },
  { name: "Daily News Egypt Retail", url: "https://dailynewsegypt.com/category/business/retail/feed/" },
  { name: "Daily News Egypt Economy", url: "https://dailynewsegypt.com/category/business/economy/feed/" }
];

// ===== Keywords =====
const PRICE_WORDS = ["price", "prices", "increase", "hike", "rise"];
const COMPANIES = ["coca", "pepsi", "chipsy", "edita", "tobacco", "eastern", "mansour", "jti"];
const PRODUCTS = ["gold", "steel", "cement"];

// ===== Helpers =====
function detectCategory(text) {
  if (PRODUCTS.some(w => text.includes(w))) return "Products";
  if (COMPANIES.some(w => text.includes(w))) return "Companies";
  return "Market";
}

function isPriceIncrease(text) {
  return PRICE_WORDS.some(w => text.includes(w));
}

// ===== Collect News =====
async function getNews() {
  let news = [];

  for (let feed of FEEDS) {
    try {
      const data = await parser.parseURL(feed.url);

      data.items.forEach(item => {
        const content = (item.title + " " + (item.contentSnippet || "")).toLowerCase();

        news.push({
          title: item.title,
          link: item.link,
          source: feed.name,
          date: item.pubDate || "",
          category: detectCategory(content),
          priceIncrease: isPriceIncrease(content)
        });
      });
    } catch (err) {
      console.log("Error loading:", feed.name);
    }
  }

  // Remove duplicates
  const unique = [];
  const titles = new Set();
  news.forEach(n => {
    if (!titles.has(n.title)) {
      titles.add(n.title);
      unique.push(n);
    }
  });

  return unique.slice(0, 40);
}

// ===== Routes =====
app.get("/", (req, res) => {
  res.send("✅ FMCG News API is running");
});

app.get("/api/data", async (req, res) => {
  const news = await getNews();

  res.json({
    status: "success",
    updated: new Date().toISOString(),
    total: news.length,
    news: news
  });
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
