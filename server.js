import express from "express";
import cors from "cors";
import Parser from "rss-parser";

const app = express();
app.use(cors());

const parser = new Parser();

app.get("/api/news", async (req, res) => {
  try {
    const feed = await parser.parseURL(
      "https://www.aljazeera.net/aljazeera/rss"
    );

    const news = feed.items.slice(0, 20).map(item => ({
      title: item.title,
      link: item.link,
      source: item.source?.title || "Google News"
    }));

    res.json(news);
  } catch (e) {
    res.status(500).json({ error: "error" });
  }
});

app.listen(10000);
