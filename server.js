import express from "express";
import cors from "cors";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());

// ✅ ربط Supabase
const supabase = createClient(
  "https://pqoidsjjghgivhhdpfqb.supabase.co",
  "sb_publishable_wgH3Lpf0D7124FV4dvTIkg_nnKnYVnc"
);

// 🟢 جلب سعر الذهب
async function getGold(){
  const res = await axios.get("https://api.gold-api.com/price/XAU");
  return res.data.price;
}

// 🟢 API الرئيسي
app.get("/api/full", async (req, res) => {
  try{

    const usdToEgp = 50;

    const goldUSD = await getGold();
    const gold21 = Math.round(((goldUSD * usdToEgp)/31.1)*0.875);

    // باقي الأسواق (مؤقت)
    const iron = 42000;
    const cars = 1000000;
    const fmcg = 20;

    // 💾 تخزين في قاعدة البيانات
    await supabase.from("market").insert([{
      gold: gold21,
      iron,
      cars,
      fmcg
    }]);

    // 📊 جلب آخر البيانات
    const { data } = await supabase
      .from("market")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    res.json({
      gold21,
      iron,
      cars,
      fmcg,
      history: data.reverse()
    });

  }catch(e){
    res.status(500).json({ error:"failed", details: e.message });
  }
});

app.listen(10000, () => {
  console.log("Server running...");
});
