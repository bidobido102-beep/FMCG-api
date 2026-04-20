const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const cron = require("node-cron");

// ملف البيانات
const DATA_FILE = "data.json";

// دالة مساعدة
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log("✅ Data updated:", new Date().toLocaleString());
}

// جلب سعر الذهب (مثال مجاني)
async function getGoldPrice() {
  try {
    const res = await axios.get("https://www.goldpricez.com/eg/gold-rates");
    const $ = cheerio.load(res.data);
    const price = $("table tr").eq(1).find("td").eq(1).text().trim();
    return price || "غير متاح";
  } catch {
    return "غير متاح";
  }
}

// أسعار الحديد والأسمنت (مثال مبسط)
async function getSteelPrice() {
  return "42000 جنيه للطن";
}

async function getCementPrice() {
  return "2100 جنيه للطن";
}

// أخبار FMCG (ثابتة كبداية)
function getFMCGNews() {
  return [
    {
      title: "زيادة متوقعة في أسعار السلع الاستهلاكية",
      source: "Market Watch",
      date: new Date().toLocaleDateString()
    },
    {
      title: "إيديتا تراجع خطط التسعير للربع القادم",
      source: "Business News",
      date: new Date().toLocaleDateString()
    }
  ];
}

// تحديث كل البيانات
async function updateAll() {
  const data = {
    lastUpdate: new Date().toISOString(),
    prices: {
      gold: await getGoldPrice(),
      steel: await getSteelPrice(),
      cement: await getCementPrice()
    },
    companies: [
      "Coca-Cola",
      "Pepsi",
      "Chipsy",
      "Edita",
      "Eastern Company",
      "Almansour",
      "JTI"
    ],
    news: getFMCGNews()
  };

  saveData(data);
}

// تشغيل أول مرة
updateAll();

// تكرار كل ساعة ⏰
cron.schedule("0 * * * *", () => {
  updateAll();
});
