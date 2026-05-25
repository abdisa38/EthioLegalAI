require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimiter = require("./middleware/rateLimiter");
const sanitizeRequest = require("./middleware/sanitizeRequest");
const errorHandler = require("./middleware/errorHandler");
const connectDatabase = require("./config/db");
const apiRoutes = require("./routes");

const app = express();
const port = process.env.PORT || 5000;

connectDatabase();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeRequest);
app.use(morgan("dev"));
app.use(rateLimiter);

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "EthioLegal AI API" });
});

app.use("/api", apiRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`EthioLegal AI API running on port ${port}`);
});
