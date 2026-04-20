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

    const data = {
      gold: {
        "24": Math.round(gold24),
        "21": Math.round(gold24 * 0.875),
        "18": Math.round(gold24 * 0.75)
      },
      iron: Math.floor(Math.random() * 5000 + 40000),
      cars: Math.floor(Math.random() * 200000 + 800000),
      fmcg: Math.floor(Math.random() * 10 + 20)
    };

    history.push({ ...data, time: new Date() });

    res.json({
      data,
      history: history.slice(-20)
    });

  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.listen(10000);
