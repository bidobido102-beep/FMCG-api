const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Server is running");
});

app.get("/api/data", (req, res) => {
  res.json({
    status: "OK",
    message: "API is working",
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
