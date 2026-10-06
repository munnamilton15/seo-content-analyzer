const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const analysisRoutes = require("./routes/analysisRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
app.use(helmet());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "SEO Content Analyzer API is running"
  });
});

app.use("/api", analysisRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});