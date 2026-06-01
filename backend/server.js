require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { apiLimiter } = require("./middleware/rateLimiters");
const sanitizeRequest = require("./middleware/sanitizeRequest");
const errorHandler = require("./middleware/errorHandler");
const { connectDatabase } = require("./config/db");
const apiRoutes = require("./routes");
const { validateEnv } = require("./config/env");

// Handle unhandled promise rejections (like the "language override" error)
process.on('unhandledRejection', (reason, promise) => {
  const errorMessage = reason?.message || String(reason);
  
  // Ignore known non-critical errors
  if (errorMessage.includes("language override unsupported")) {
    console.warn("⚠️  Unhandled rejection (ignored): language override unsupported");
    return;
  }
  
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const errorMessage = error?.message || String(error);
  
  // Ignore known non-critical errors
  if (errorMessage.includes("language override unsupported")) {
    console.warn("⚠️  Uncaught exception (ignored): language override unsupported");
    return;
  }
  
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

console.log("🔧 Allowed CORS Origins:", allowedOrigins);

validateEnv();
connectDatabase();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "no-referrer" },
  hsts: { maxAge: 15552000, includeSubDomains: true },
}));
app.use(cors({
  origin: (origin, callback) => {
    console.log("🌐 Request from origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.log("❌ Origin not allowed:", origin, "Allowed:", allowedOrigins);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || "ethiolegal"));
app.use(sanitizeRequest);
app.use(morgan("dev"));
app.use(apiLimiter);

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "EthioLegal AI API" });
});

app.use("/api", apiRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`EthioLegal AI API running on port ${port}`);
});
