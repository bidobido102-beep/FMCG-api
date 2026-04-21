import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;

// 🟢 جلب الذهب
async function getGold(){
  try{
    const res = await axios.get("https://api.gold-api.com/price/XAU");
    return res.data.price;
  }catch{
    return 2300;
  }
}

// 🟢 API
app.get("/api/full", async (req, res) => {
  try{

    const usdToEgp = 50;

    const goldUSD = await getGold();
    const gold21 = Math.round(((goldUSD * usdToEgp)/31.1)*0.875);

    const iron = 42000;
    const cars = 1000000;
    const fmcg = 20;

    res.json({
      gold21,
      iron,
      cars,
      fmcg,
      history: []
    });

  }catch(e){
    res.status(500).json({ error:"server error" });
  }
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
