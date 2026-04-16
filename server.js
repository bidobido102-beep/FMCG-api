import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "*"
}));

app.get("/api/news", async (req, res) => {
  try {
    const response = await fetch("https://gnews.io/api/v4/search?q=egypt%20food&lang=ar&max=10&token=YOUR_API_KEY");
    const data = await response.json();

    const news = data.articles.map(item => ({
      title: item.title,
      link: item.url,
      source: item.source.name
    }));

    res.json(news);

  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "failed" });
  }
});

app.listen(10000);
