import express from "express";
import cors from "cors";
import Parser from "rss-parser";

const app = express();

app.use(cors({
  origin: "*"
}));

const parser = new Parser();

app.get("/api/news", async (req, res) => {
  try {
    const feeds = [
      "https://www.aljazeera.net/aljazeera/rss",
      "https://www.skynewsarabia.com/web/rss"
    ];

    let allNews = [];

    for (let url of feeds) {
      const feed = await parser.parseURL(url);

      const news = feed.items.slice(0, 10).map(item => ({
        title: item.title,
        link: item.link,
        source: feed.title
      }));

      allNews = [...allNews, ...news];
    }

    res.json(allNews);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "failed to fetch news" });
  }
});

app.listen(10000);
