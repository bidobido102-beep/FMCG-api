import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

let history = [];

app.get("/api/market", async (req, res) => {
  try {

    // 🔹 ذهب (API حقيقي)
    const goldRes = await fetch("https://api.gold-api.com/price/XAU");
    const goldData = await goldRes.json();

    const usdToEgp = 50;
    const gold24 = (goldData.price * usdToEgp) / 31.1;

    const gold = {
      "24": Math.round(gold24),
      "21": Math.round(gold24 * 0.875),
      "18": Math.round(gold24 * 0.75),
      ounce: Math.round(gold24 * 31.1)
    };

    // 🔹 حديد وأسمنت (قابل للتحديث)
    const building = {
      iron: 42000,
      cement: 2000
    };

    // 🔹 سيارات
    const cars = [
      { name: "Toyota Corolla", price: 1300000 },
      { name: "Hyundai Elantra", price: 950000 },
      { name: "Nissan Sunny", price: 800000 }
    ];

    // 🔹 FMCG
    const fmcg = [
      { name: "Coca-Cola", price: 15 },
      { name: "Pepsi", price: 14 },
      { name: "Chipsy", price: 10 },
      { name: "Edita", price: 20 },
      { name: "Eastern Tobacco", price: 35 }
    ];

    // 🔹 تخزين التاريخ
    history.push({
      gold21: gold["21"],
      time: new Date().toLocaleTimeString()
    });

    res.json({
      gold,
      building,
      cars,
      fmcg,
      history: history.slice(-20)
    });

  } catch (e) {
    res.status(500).json({ error: "failed" });
  }
});

app.listen(10000);
