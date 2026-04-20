import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
app.use(cors());

let history = {
  gold: [],
  iron: []
};

// 🟢 Scraping أسعار الحديد من موقع مصري
async function getIronPrice() {
  try {
    const { data } = await axios.get("https://www.youm7.com/Section/أسعار/297/1");
    const $ = cheerio.load(data);

    let text = $("body").text();
    let match = text.match(/الحديد.*?(\d{4,5})/);

    return match ? parseInt(match[1]) : 42000;

  } catch {
    return 42000;
  }
}

// 🟢 API ذهب
async function getGold(){
  const res = await axios.get("https://api.gold-api.com/price/XAU");
  return res.data.price;
}

// 🟢 Endpoint
app.get("/api/full", async (req, res) => {

  const usdToEgp = 50;

  const goldUSD = await getGold();
  const gold21 = Math.round(((goldUSD * usdToEgp) / 31.1) * 0.875);

  const iron = await getIronPrice();

  // تخزين
  history.gold.push(gold21);
  history.iron.push(iron);

  res.json({
    gold21,
    iron,
    history
  });

});

app.listen(10000);
