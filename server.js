import express from "express";
import cors from "cors";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());

// ✅ مهم جدًا لRailway
const PORT = process.env.PORT || 10000;

// 🔴 Supabase
const supabase = createClient(
  "https://pqoidsjjghgivhhdpfqb.supabase.co",
  "sb_publishable_wgH3Lpf0D7124FV4dvTIkg_nnKnYVnc"
);

// 🟢 ذهب (محمي من الكراش)
async function getGold(){
  try{
    const res = await axios.get("https://api.gold-api.com/price/XAU");
    return res.data.price;
  }catch{
    return 2300; // fallback
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

    // 🧠 حاول تخزين (لو فشل ما يكراش)
    try{
      await supabase.from("market").insert([{
        gold: gold21,
        iron,
        cars,
        fmcg
      }]);
    }catch(e){
      console.log("DB insert error:", e.message);
    }

    // 🧠 جلب البيانات
    let history = [];
    try{
      const { data } = await supabase
        .from("market")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      history = data ? data.reverse() : [];
    }catch(e){
      console.log("DB fetch error:", e.message);
    }

    res.json({
      gold21,
      iron,
      cars,
      fmcg,
      history
    });

  }catch(e){
    res.status(500).json({ error:"server crashed", details:e.message });
  }

});

// 🟢 تشغيل السيرفر
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
