const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint تجريبي
app.get("/api/data", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is working",
    time: new Date()
  });
});

app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
