import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

let priceHistory = [];

app.get("/api/gold", async (req, res) => {
  try {
    const response = await fetch("https://api.gold-api.com/price/XAU");
    const data = await response.json();

    const price = data.price;

    // حفظ السعر
    priceHistory.push({
      price,
      time: new Date()
    });

    // آخر سعرين
    let trend = "stable";
    if (priceHistory.length > 1) {
      const prev = priceHistory[priceHistory.length - 2].price;
      if (price > prev) trend = "up";
      if (price < prev) trend = "down";
    }

    res.json({
      price,
      trend,
      history: priceHistory.slice(-10)
    });

  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.listen(10000);
