const express = require("express");
const app = express();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("✅ Server is running on Railway");
});

app.get("/api/data", (req, res) => {
  res.json({
    status: "OK",
    message: "API works successfully ✅",
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
