import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

let lastPrice = null;

app.get("/api/market", async (req, res) => {
  try {
    const response = await fetch("https://api.gold-api.com/price/XAU");
    const data = await response.json();

    const usdGold = data.price;

    // تحويل تقريبي لجنيه مصري
    const usdToEgp = 50;
    const gold24 = (usdGold * usdToEgp) / 31.1;

    const prices = {
      gold: {
        "24": Math.round(gold24),
        "21": Math.round(gold24 * 0.875),
        "18": Math.round(gold24 * 0.75),
        ounce: Math.round(gold24 * 31.1)
      },

      iron: "45000 جنيه / طن",
      cement: "2000 جنيه / طن",

      cars: {
        toyota: "1,200,000 جنيه",
        hyundai: "850,000 جنيه"
      },

      fmcg: {
        "Coca Cola": "15 جنيه",
        "Pepsi": "14 جنيه",
        "Nestle Milk": "30 جنيه"
      }
    };

    let trend = "stable";
    if (lastPrice) {
      if (prices.gold["21"] > lastPrice) trend = "up";
      if (prices.gold["21"] < lastPrice) trend = "down";
    }

    lastPrice = prices.gold["21"];

    res.json({
      prices,
      trend
    });

  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.listen(10000);
