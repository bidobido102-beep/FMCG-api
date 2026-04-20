import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

let history = [];

app.get("/api/dashboard", async (req, res) => {
  try {
    const goldRes = await fetch("https://api.gold-api.com/price/XAU");
    const goldData = await goldRes.json();

    const usdToEgp = 50;
    const gold24 = (goldData.price * usdToEgp) / 31.1;
    const gold21 = Math.round(gold24 * 0.875);

    const data = {
      gold21
    };

    history.push({
      price: gold21,
      time: new Date().toLocaleTimeString()
    });

    res.json({
      data,
      history: history.slice(-20)
    });

  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.listen(10000);
